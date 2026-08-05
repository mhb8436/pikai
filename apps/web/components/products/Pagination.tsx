"use client";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPage,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPage;

  const handlePreviousPage = () => {
    if (isFirstPage) return;

    onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (isLastPage) return;

    onPageChange(currentPage + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: "40px",
        marginTop: "40px",
        marginBottom: "40px",
      }}
    >
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={handlePreviousPage}
        disabled={isFirstPage}
        aria-label="이전 페이지"
        style={{
          width: "60px",
          height: "38px",
          minWidth: 0,
          minHeight: 0,
          padding: 0,
          border: "1px solid #d7dee5",
          borderRadius: "10px",
          backgroundColor: "#fff",
          fontSize: "20px",
          lineHeight: 1,
          cursor: isFirstPage ? "default" : "pointer",
          opacity: isFirstPage ? 0.35 : 1,
        }}
      >
        ‹
      </button>

      {/* 현재 페이지 / 전체 페이지 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: "65px",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        <span
          style={{
            color: "#111",
            fontWeight: 700,
          }}
        >
          {currentPage}
        </span>

        <span
          style={{
            color: "#999",
            fontWeight: 400,
          }}
        >
          /
        </span>

        <span
          style={{
            color: "#888",
            fontWeight: 600,
          }}
        >
          {totalPage}
        </span>
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={handleNextPage}
        disabled={isLastPage}
        aria-label="다음 페이지"
        style={{
          width: "60px",
          height: "36px",
          minWidth: 0,
          minHeight: 0,
          padding: 0,
          border: "1px solid #d7dee5",
          borderRadius: "8px",
          backgroundColor: "#fff",
          fontSize: "22px",
          lineHeight: 1,
          cursor: isLastPage ? "default" : "pointer",
          opacity: isLastPage ? 0.35 : 1,
        }}
      >
        ›
      </button>
    </div>
  );
}
