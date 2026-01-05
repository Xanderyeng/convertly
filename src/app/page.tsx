import type { Metadata } from "next";
import { ImageConverter } from "@/components/converter/image-converter";

export const metadata: Metadata = {
  title: "Image Converter - Fast & Efficient Web Image Optimization",
  description:
    "Convert images to web-optimized formats (WEBP, AVIF, PNG, JPG) instantly. Fast, secure, and powered by CloudConvert API.",
  keywords: [
    "image converter",
    "webp converter",
    "avif converter",
    "image optimization",
    "format conversion",
    "cloudconvert",
  ],
  openGraph: {
    title: "Image Converter - Fast & Efficient",
    description: "Convert images to web-optimized formats instantly",
    type: "website",
  },
};

export default function Home() {
  return <ImageConverter />;
}
