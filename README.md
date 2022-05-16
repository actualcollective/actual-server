This is a reimplementation of the official [actual-server](https://github.com/actualbudget/actual-server) in typescript featuring multi-account support

---
## Requirements
- S3 compatible storage
## Usage
1. Copy the example env file
  ```bash
cp .env.example .env
   ```
2. Fill in the s3 connection details
  ```
S3_BUCKET=
S3_REGION=
S3_ENDPOINT_URL=
S3_ACCESS_KEY=
S3_SECRET_KEY=
  ```
3. Use the prebuilt image or build the image yourself (default is to build)
  ```
    ...
    actual:
    container_name: actual
  - build: ./
  + image: ghcr.io/actualcollective/actual-server:latest
    links:
      - postgres
    ...
  ```
4. Run
  ```
docker-compose up
  ```
## Credits
- [@jlongster](https://github.com/jlongster) for [actual](https://github.com/actualbudget), merkle and timestamp implementation
## Todos
- implement file rename endpoint
- fix header validation
- bank sync support
- server-side transaction api
- Support for the official client
- self-host capabilities (filesystem with both support for s3/local)
