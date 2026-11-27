const mriAssetOrigin = "https://brain-tumor-mri-research.vercel.app";
const mriAssets = [
  "research/reference.json",
  "research/embeddings.f32",
  "research/cluster-fits.json",
  "research/example-glioma.png",
  "research/example-menin.png",
  "research/example-tumor.png",
  "vendor/ort.wasm.min.js",
  "vendor/ort-wasm-simd-threaded.mjs",
  "vendor/ort-wasm-simd-threaded.wasm",
  "model/resnet50.onnx",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Keep the published reference data and model at their existing URLs.
    return mriAssets.map(path => ({
      source: `/mri-explorer/${path}`,
      destination: `${mriAssetOrigin}/${path}`,
    }));
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }, {
      // Font filenames contain content hashes, so cached bytes never change.
      source: "/fonts/:fontFile",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, ...[
      // Publish a new filename whenever either portrait asset is revised.
      "/images/entrance-alpine-ripples.mp4",
      "/images/entrance-alpine-armor.webp",
      "/images/entrance-alpine-detail.mp4",
      "/images/entrance-alpine-compact.mp4",
      "/images/entrance-alpine-detail.webp",
    ].map(source => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    })), {
      source: "/demos/granted/index.html",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-ancestors 'self'; form-action 'none'; base-uri 'none'" },
        { key: "X-Robots-Tag", value: "noindex" },
      ],
    }, {
      source: "/mri-explorer/index.html",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; connect-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'; form-action 'none'" },
        { key: "X-Robots-Tag", value: "noindex" },
      ],
    }];
  },
};

export default nextConfig;
