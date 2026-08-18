/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 75 = qualité par défaut de next/image ; 85 = utilisée pour l'image du
    // Hero (photo pleine largeur, mérite un peu plus de netteté).
    qualities: [75, 85],
  },
};

export default nextConfig;
