/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/find-clinics",
        destination: "/directory",
        permanent: true,
      },
      {
        source: "/for-schools",
        destination: "/schools",
        permanent: true,
      },
      {
        source: "/for-clinics",
        destination: "/clinics",
        permanent: true,
      },
      {
        source: "/for-clinics/pricing",
        destination: "/clinics/pricing",
        permanent: true,
      },
      {
        source: "/blog/head-lice-treatment-for-adults",
        destination: "/professional/head-lice-treatment-for-adults",
        permanent: true,
      },
      {
        source: "/blog/what-are-the-first-signs-of-head-lice",
        destination: "/symptoms/what-are-the-first-signs-of-head-lice",
        permanent: true,
      },
      {
        source: "/blog/best-over-the-counter-head-lice-treatment-for-sensitive-skin",
        destination: "/professional/best-over-the-counter-head-lice-treatment-for-sensitive-skin",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
