"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Cart } from "@/types/cartType";
import Cookies from "js-cookie";
import Link from "next/link";
// 장바구니 페이지
export default function CartPage() {
  const router = useRouter();
  // 장바구니 정보
  const [cart, setCart] = useState<Cart | null>(null);

  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  // 장바구니 상품 목록
  const cartItems = cart?.cartItems ?? [];

  const handleItemSelect = (cartItemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId],
    );
  };
  // 전체 상품 선택 또는 전체 해제
  const handleSelectAll = () => {
    const allItemIds = cart?.cartItems?.map((item: any) => item.id) ?? [];

    const isAllSelected =
      allItemIds.length > 0 &&
      allItemIds.every((id: number) => selectedItems.includes(id));

    setSelectedItems(isAllSelected ? [] : allItemIds);
  };

  // 장바구니 상품 수량 변경
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      // 로그인할 때 쿠키에 저장한 JWT 토큰을 가져옵니다.
      const token = Cookies.get("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/cart/items/${cartItemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("수량 변경 실패");
      }

      // 수량 변경 후 현재 장바구니 상품을 다시 조회합니다.
      const cartResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/cart/page`,
        {
          method: "GET",

          // JWT 인증이 적용된 CartController를 호출하므로 토큰을 보냅니다.
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const cartData = await cartResponse.json();

      setCart(cartData);
    } catch (error) {
      console.error(error);
    }
  };

  // 장바구니 상품 삭제
  const deleteCartItem = async (cartItemId: number) => {
    try {
      // 로그인할 때 쿠키에 저장한 JWT 토큰을 가져옵니다.
      const token = Cookies.get("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/cart/items/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("장바구니 상품 삭제 실패");
      }
      //==================================================
      // 삭제 후에도 장바구니 화면 전용 API로 다시 조회합니다.
      // is_now=false인 상품을 선택 상태와 관계없이 모두 가져옵니다.
      const cartResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/cart/page`,
        {
          method: "GET",

          // CartController에 JWT 인증이 적용되어 있으므로 토큰을 보냅니다.
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!cartResponse.ok) {
        throw new Error("삭제 후 장바구니를 다시 불러오지 못했습니다.");
      }

      const cartData = await cartResponse.json();

      setCart(cartData);

      // 삭제된 상품은 선택 목록에서도 제거
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
    } catch (error) {
      console.error(error);
    }
  };

  // 선택한 장바구니 상품 삭제
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert("삭제할 상품을 선택해 주세요.");
      return;
    }

    for (const cartItemId of selectedItems) {
      await deleteCartItem(cartItemId);
    }
  };

  const updateSelectedItems = async () => {
    try {
      // 로그인할 때 쿠키에 저장한 JWT 토큰을 가져옵니다.
      const token = Cookies.get("accessToken");
      // 1. 모든 상품 선택 해제
      await Promise.all(
        cartItems.map((item) =>
          fetch(
            `${process.env.NEXT_PUBLIC_BACK_URL}/cart/items/${item.id}/select`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                // 선택 상태 수정 API도 JWT 인증이 필요하므로 토큰을 보냅니다.
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                is_selected: false,
              }),
            },
          ),
        ),
      );

      // 2. 선택된 상품만 true
      await Promise.all(
        selectedItems.map((cartItemId) =>
          fetch(
            `${process.env.NEXT_PUBLIC_BACK_URL}/cart/items/${cartItemId}/select`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                // 선택한 상품을 다시 true로 바꿀 때도 JWT 토큰을 보냅니다.
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                is_selected: true,
              }),
            },
          ),
        ),
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // 체크된 상품만 결제 페이지로 보내는 함수입니다.
  const handleSelectedOrder = async () => {
    // 체크된 상품이 하나도 없으면 결제를 진행하지 않습니다.
    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해 주세요.");
      return;
    }

    try {
      // 현재 화면의 체크 상태를 DB의 is_selected 값에 저장합니다.
      await updateSelectedItems();

      // selectedOnly=true:
      // DB에서 is_selected=true인 상품만 결제 페이지에서 조회합니다.
      const params = new URLSearchParams();
      params.set("isCartOrder", "true");
      params.set("selectedOnly", "true");

      // 선택 상품 결제 페이지로 이동합니다.
      router.push(`/pay?${params.toString()}`);
    } catch (error) {
      console.error(error);
      alert("선택 상품 주문 중 오류가 발생했습니다.");
    }
  };

  // 장바구니의 모든 상품을 결제 페이지로 보내는 함수입니다.
  const handleAllOrder = async () => {
    try {
      // 전체 구매이므로 selectedOnly=false를 전달합니다.
      const params = new URLSearchParams();
      params.set("isCartOrder", "true");
      params.set("selectedOnly", "false");
      //=====================
      // 전체 상품 주문에서는 기존 결제 API가
      // is_selected=false인 상품을 조회하므로,
      // 일반 장바구니 상품의 선택 상태를 모두 false로 저장합니다.
      await Promise.all(
        cartItems.map((item) =>
          fetch(
            `${process.env.NEXT_PUBLIC_BACK_URL}/cart/items/${item.id}/select`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("accessToken")}`,
              },
              body: JSON.stringify({
                is_selected: false,
              }),
            },
          ),
        ),
      );
      //=====================
      // 전체 상품 결제 페이지로 이동합니다.
      router.push(`/pay?${params.toString()}`);
    } catch (error) {
      console.error(error);
      alert("전체 상품 주문 중 오류가 발생했습니다.");
    }
  };
  // 에러 메시지
  const [error, setError] = useState("");

  // 장바구니 조회
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");
        // 로그인 시 저장한 JWT 토큰을 쿠키에서 가져옵니다.
        const token = Cookies.get("accessToken");
        //=====================================================
        // 장바구니 화면 전용 API를 호출합니다.
        // is_now=false인 상품을 is_selected 값과 관계없이 모두 가져옵니다.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/cart/page`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        //if (!response.ok) {
        //  throw new Error("장바구니를 불러오지 못했습니다.");
        // }
        // 새로 가입한 회원은 아직 장바구니가 생성되지 않아
        // 404가 올 수 있으므로 빈 장바구니 화면으로 처리합니다.
        if (response.status === 404) {
          setCart(null);
          setSelectedItems([]);
          setError("");
          return;
        }

        // 404가 아닌 실제 서버 오류는 기존 오류 처리로 넘깁니다.
        if (!response.ok) {
          throw new Error("장바구니를 불러오지 못했습니다.");
        }

        const data = await response.json();

        setCart(data);
        // DB에서 is_selected=true인 상품의 id만 골라서
        // 화면의 체크박스가 처음부터 체크되도록 합니다.
        const selectedIds = data.cartItems
          .filter((item: Cart["cartItems"][number]) => item.is_selected)
          .map((item: Cart["cartItems"][number]) => item.id);

        setSelectedItems(selectedIds);
      } catch (error) {
        console.error(error);
        setError("장바구니 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // 선택된 상품의 총 금액
  // const selectedTotalPrice =
  // cart?.cartItems
  //  ?.filter((item: any) => selectedItems.includes(item.id))
  // .reduce(
  //   (total: number, item: any) => total + item.price * item.quantity,
  //   0,
  // ) ?? 0;
  // 선택된 상품들의 할인 적용 총금액
  const selectedTotalPrice =
    cart?.cartItems
      ?.filter((item: any) => selectedItems.includes(item.id))
      .reduce(
        (total: number, item: any) =>
          total + Math.floor(item.price * 0.9) * item.quantity,
        0,
      ) ?? 0;

  // 장바구니가 비어있는지 확인
  const isCartEmpty = !cart?.cartItems || cart.cartItems.length === 0;

  return (
    <main className={styles.container}>
      {/* 로딩 메시지 */}
      {loading && <p>장바구니를 불러오는 중입니다.</p>}

      {/* 에러 메시지 */}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {/* 빈 장바구니 안내 */}
      {!loading && !error && isCartEmpty && (
        <p className={styles.emptyMessage}>장바구니에 담긴 상품이 없습니다.</p>
      )}
      {!isCartEmpty && (
        <>
          {/* 전체선택과 삭제 버튼 */}
          <div className={styles.cartToolbar}>
            <label className={styles.selectAllLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={
                  cart?.cartItems?.length > 0 &&
                  selectedItems.length === cart.cartItems.length
                }
                onChange={handleSelectAll}
              />
              <span>전체선택</span>
            </label>

            <button
              type="button"
              className={styles.toolbarDeleteButton}
              onClick={deleteSelectedItems}
            >
              삭제
            </button>
          </div>

          {/* 장바구니 상품 목록 */}
          <div className={styles.cartContent}>
            <section className={styles.productList}>
              {cart?.cartItems?.map((item: any) => (
                <div key={item.id} className={styles.productCard}>
                  <div className={styles.cartItem}>
                    {/* 상품 체크박스 */}
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                    />

                    {/* 상품 이미지 */}
                    <Link href={`/product/${item.detailColor.products.id}`}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.detailColor.products.color_main_image}`}
                        alt={item.detailColor.products.name}
                        className={styles.productImage}
                      />
                    </Link>
                    {/* 상품 정보 */}
                    <div className={styles.productInfo}>
                      {/* 상품명 */}
                      <Link
                        href={`/product/${item.detailColor.products.id}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        <h3 className={styles.productName}>
                          {item.detailColor.products.name}
                        </h3>
                      </Link>

                      {/* 원래 상품 가격 */}
                      <p className={styles.originalPrice}>
                        상품가격 :{" "}
                        {item.detailColor.products.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {/* 수량과 할인 적용가 */}
                  <div className={styles.productBottom}>
                    {/* 옵션 색상과 수량 */}
                    <div>
                      {/* 옵션 색상명 */}
                      <p className={styles.colorName}>
                        {item.detailColor.color_name}
                      </p>

                      {/* 수량 */}
                      <div className={styles.quantityControl}>
                        <button
                          type="button"
                          className={styles.quantityButton}
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                        >
                          -
                        </button>

                        <span className={styles.quantityNumber}>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className={styles.quantityButton}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 상품 가격
                    <div className={styles.discountArea}>
                      <p className={styles.discountPrice}>
                        {item.price.toLocaleString()}원
                      </p>
                    </div> */}
                    {/* 할인 적용 가격 */}
                    <div className={styles.discountArea}>
                      <span className={styles.discountLabel}>10% 할인가</span>

                      <span className={styles.discountPrice}>
                        {Math.floor(item.price * 0.9).toLocaleString("ko-KR")}원
                      </span>
                    </div>
                  </div>
                  {/* 배송비와 예상 주문금액 */}
                  <div className={styles.productPriceInfo}>
                    <div className={styles.priceInfoRow}>
                      <span>배송비</span>
                      <strong>무료</strong>
                    </div>

                    <div className={styles.priceInfoRow}>
                      <span>예상 주문금액</span>
                      <strong>
                        {(
                          Math.floor(item.price * 0.9) * item.quantity
                        ).toLocaleString("ko-KR")}
                        원
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* 주문 금액 영역 */}
            <section className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>주문 예상 금액</span>
                <strong>{selectedTotalPrice.toLocaleString("ko-KR")}원</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>총 선택 상품 금액</span>
                <strong>{selectedTotalPrice.toLocaleString("ko-KR")}원</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>배송비</span>
                <strong>무료</strong>
              </div>

              <div className={styles.summaryTotal}>
                <span>총 주문 예상 금액</span>
                <strong>{selectedTotalPrice.toLocaleString("ko-KR")}원</strong>
              </div>

              <button
                type="button"
                className={styles.orderButton}
                onClick={handleSelectedOrder}
              >
                선택 상품 주문
              </button>
              {/* 체크 여부와 관계없이 장바구니의 모든 상품을 주문합니다. */}
              <button
                type="button"
                className={styles.orderButton}
                onClick={handleAllOrder}
              >
                전체 상품 주문
              </button>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
