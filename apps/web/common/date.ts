export function formatDateSimple(dateString: string | Date) {
  if (!dateString) return "";

  return new Date(dateString)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\.$/, "");
}
