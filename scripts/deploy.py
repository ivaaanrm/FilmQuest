#!/usr/bin/env python3
"""Deploy script for FilmQuest.

Reads Terraform outputs from infra/ and deploys frontend assets to S3
and/or Lambda function code to AWS.

Usage:
    python scripts/deploy.py all             # deploy everything
    python scripts/deploy.py frontend        # frontend only
    python scripts/deploy.py lambdas         # both lambdas
    python scripts/deploy.py lambda:questions # single lambda
    python scripts/deploy.py lambda:recommender
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import boto3

ROOT = Path(__file__).resolve().parent.parent
INFRA_DIR = ROOT / "infra"
FRONTEND_DIR = ROOT / "frontend"
BACKEND_DIR = ROOT / "backend"

LAMBDA_DEFS: dict[str, dict] = {
    "questions": {
        "source_dir": BACKEND_DIR / "question_generator",
        "function_suffix": "question-generator",
    },
    "recommender": {
        "source_dir": BACKEND_DIR / "recommender",
        "function_suffix": "recommender",
    },
}


def get_terraform_outputs() -> dict[str, str]:
    """Read Terraform outputs from the infra directory."""
    result = subprocess.run(
        ["terraform", "output", "-json"],
        cwd=INFRA_DIR,
        capture_output=True,
        text=True,
        check=True,
    )
    raw = json.loads(result.stdout)
    return {k: v["value"] for k, v in raw.items()}


def deploy_frontend(outputs: dict[str, str]) -> None:
    """Build the Vite app and sync to S3, then invalidate CloudFront."""
    bucket = outputs["frontend_bucket_name"]
    distribution_id = outputs["cloudfront_distribution_id"]

    print("=> Building frontend...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        check=True,
    )

    dist_dir = FRONTEND_DIR / "dist"
    if not dist_dir.exists():
        sys.exit("Build failed: frontend/dist not found")

    s3 = boto3.client("s3")

    print(f"=> Uploading to s3://{bucket}/ ...")
    for path in sorted(dist_dir.rglob("*")):
        if path.is_dir():
            continue
        key = str(path.relative_to(dist_dir))
        content_type, _ = mimetypes.guess_type(str(path))
        extra = {}
        if content_type:
            extra["ContentType"] = content_type
        # Cache-bust HTML, cache assets long-term (Vite hashes filenames)
        if key.endswith(".html"):
            extra["CacheControl"] = "no-cache"
        elif key.startswith("assets/"):
            extra["CacheControl"] = "public, max-age=31536000, immutable"
        s3.upload_file(str(path), bucket, key, ExtraArgs=extra)
        print(f"   {key}")

    print("=> Invalidating CloudFront cache...")
    cf = boto3.client("cloudfront")
    cf.create_invalidation(
        DistributionId=distribution_id,
        InvalidationBatch={
            "Paths": {"Quantity": 1, "Items": ["/*"]},
            "CallerReference": str(hash((bucket, distribution_id, os.urandom(8)))),
        },
    )
    print("   Done.")


def build_lambda_zip(source_dir: Path) -> Path:
    """Install deps and package a Lambda zip, returning the zip path."""
    tmp = Path(tempfile.mkdtemp())
    package_dir = tmp / "package"

    requirements = source_dir / "requirements.txt"
    if requirements.exists():
        print(f"   Installing dependencies from {requirements.name}...")
        subprocess.run(
            [
                sys.executable, "-m", "pip", "install",
                "--target", str(package_dir),
                "-r", str(requirements),
                "--quiet",
            ],
            check=True,
        )

    # Copy source files on top (overrides any same-named packages)
    print("   Copying source files...")
    for item in source_dir.iterdir():
        if item.name in ("__pycache__", ".env", "requirements.txt"):
            continue
        dest = package_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)

    zip_path = tmp / "lambda.zip"
    print("   Creating zip...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(package_dir.rglob("*")):
            if path.is_dir():
                continue
            zf.write(path, path.relative_to(package_dir))

    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"   Package size: {size_mb:.1f} MB")
    return zip_path


def deploy_lambda(name: str, outputs: dict[str, str]) -> None:
    """Build and deploy a single Lambda function."""
    defn = LAMBDA_DEFS[name]
    source_dir: Path = defn["source_dir"]
    project_name = outputs["frontend_bucket_name"].split("-frontend-")[0]
    function_name = f"{project_name}-{defn['function_suffix']}"

    print(f"=> Packaging lambda: {name} ({source_dir.name}/)")
    zip_path = build_lambda_zip(source_dir)

    print(f"=> Updating function {function_name}...")
    lam = boto3.client("lambda")
    with open(zip_path, "rb") as f:
        lam.update_function_code(
            FunctionName=function_name,
            ZipFile=f.read(),
        )
    print("   Done.")

    # Clean up temp files
    shutil.rmtree(zip_path.parent, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Deploy FilmQuest components")
    parser.add_argument(
        "target",
        choices=["all", "frontend", "lambdas", "lambda:questions", "lambda:recommender"],
        help="What to deploy",
    )
    args = parser.parse_args()

    print("=> Reading Terraform outputs...")
    outputs = get_terraform_outputs()

    if args.target in ("all", "frontend"):
        deploy_frontend(outputs)

    if args.target in ("all", "lambdas"):
        for name in LAMBDA_DEFS:
            deploy_lambda(name, outputs)
    elif args.target.startswith("lambda:"):
        name = args.target.split(":", 1)[1]
        deploy_lambda(name, outputs)

    print("\n=> Deployment complete!")
    if args.target in ("all", "frontend"):
        print(f"   Frontend: https://{outputs['cloudfront_domain']}")
    if args.target in ("all", "lambdas") or args.target.startswith("lambda:"):
        print(f"   API:      {outputs['api_gateway_url']}")


if __name__ == "__main__":
    main()
