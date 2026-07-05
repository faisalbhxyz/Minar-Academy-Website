export function resolveCertificateTemplateUrl(templatePath: string): string {
  if (!templatePath) return "/images/placeholder.svg";
  if (templatePath.startsWith("http://") || templatePath.startsWith("https://")) {
    return templatePath;
  }
  return templatePath.startsWith("/") ? templatePath : `/${templatePath}`;
}

export function formatCertificateDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
