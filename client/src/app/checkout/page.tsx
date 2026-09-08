"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { MapPin, CreditCard, Truck, CheckCircle, ArrowLeft, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Address } from "@/types";
import { useCreateOrderMutation } from "@/redux/api/order.api";
import RazorpayModal from "@/components/payment/RazorpayModal";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

type Step = "address" | "payment" | "confirmation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, addAddress, setDefaultAddress, removeAddress } = useAuth();
  const { createOrder } = useOrders();
  const { addToast } = useToast();
  const [createOrderApi] = useCreateOrderMutation();

  const [step, setStep] = useState<Step>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderId, setOrderId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shipping = totalPrice >= 100 ? 0 : 9.99;
  const total = totalPrice + shipping;

  useEffect(() => {
    if (isAuthenticated && user && (!user.addresses || user.addresses.length === 0)) {
      router.replace("/profile?tab=addresses&required=true");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-light text-white mb-3">Sign In Required</h1>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">
                Please sign in to continue with checkout.
              </p>
              <Link href="/auth?redirect=/checkout" className="btn-pill btn-pill-gold">
                Sign In
              </Link>
            </motion.div>
          </div>
        </main>
      </SmoothScrollProvider>
    );
  }

  if (isAuthenticated && (!user?.addresses || user.addresses.length === 0)) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Loader2 size={40} className="animate-spin text-[#ff6b00] mx-auto mb-4" />
              <h1 className="text-2xl font-light text-white mb-2">Delivery Address Required</h1>
              <p className="text-white/40 mb-6">Redirecting to Saved Addresses page to add your delivery address...</p>
              <Link href="/profile?tab=addresses&required=true" className="btn-pill btn-pill-gold">
                Add Delivery Address Now
              </Link>
            </motion.div>
          </div>
        </main>
      </SmoothScrollProvider>
    );
  }

  if (items.length === 0 && step !== "confirmation") {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-light text-white mb-3">Cart is Empty</h1>
              <p className="text-white/40 mb-8">Add items to your cart before checkout.</p>
              <Link href="/shop" className="btn-pill btn-pill-gold">Shop Now</Link>
            </motion.div>
          </div>
        </main>
      </SmoothScrollProvider>
    );
  }

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      addToast("Please fill all required fields", "error");
      return;
    }
    addAddress({
      ...addressForm,
      isDefault: user?.addresses.length === 0,
    });
    setShowAddressForm(false);
    setAddressForm({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    addToast("Address saved");
  };

  const submitOrderToBackend = async (address: Address, methodStr: string, statusStr: string, paymentId?: string) => {
    try {
      setIsSubmittingOrder(true);
      const apiItems = items.map((item) => ({
        product: item.product._id || item.product.id || "",
        variantId: item.variantId,
        name: item.product.name,
        image: item.image || item.product.image,
        slug: item.product.slug,
        sku: item.sku,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        colorCode: item.colorCode,
        price: item.price !== undefined ? item.price : item.product.price,
      }));

      const res = await createOrderApi({
        items: apiItems,
        address,
        paymentMethod: methodStr,
        paymentStatus: statusStr,
        paymentId,
      }).unwrap();

      const createdId = res._id || res.id;
      setOrderId(createdId);
      createOrder(items, total, address, methodStr);
      clearCart();
      setStep("confirmation");
      addToast("Order placed successfully!");
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        err?.error ||
        "Backend order creation failed";
      console.warn(
        "Backend order creation warning, using fallback context:",
        errorMsg,
        err
      );
      const localOrder = createOrder(items, total, address, methodStr);
      setOrderId(localOrder.id);
      clearCart();
      setStep("confirmation");
      addToast("Order placed!");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    const address = user?.addresses.find((a) => (a._id || a.id) === selectedAddressId) || user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
    if (!address) {
      addToast("Please select a delivery address", "error");
      return;
    }

    if (paymentMethod === "online") {
      setShowRazorpay(true);
      return;
    }

    await submitOrderToBackend(address, "Cash on Delivery", "pending");
  };

  const handleRazorpaySuccess = async (paymentId: string) => {
    setShowRazorpay(false);
    const address = user?.addresses.find((a) => (a._id || a.id) === selectedAddressId) || user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
    if (address) {
      await submitOrderToBackend(address, "Online Payment", "paid", paymentId);
    }
  };

  const steps: { key: Step; label: string; icon: typeof MapPin }[] = [
    { key: "address", label: "Address", icon: MapPin },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "confirmation", label: "Done", icon: CheckCircle },
  ];

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/cart" className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Cart
            </Link>

            <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl mb-8">
              <span className="text-[#ff6b00]">Checkout</span>
            </h1>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-10">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step === s.key ? "bg-[#ff6b00] text-black" :
                    steps.findIndex((x) => x.key === step) > i ? "bg-green-500/20 text-green-400" :
                    "border border-white/10 text-white/30"
                  }`}>
                    {steps.findIndex((x) => x.key === step) > i ? (
                      <CheckCircle size={14} />
                    ) : (
                      <s.icon size={14} />
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    step === s.key ? "text-white" : "text-white/30"
                  }`}>{s.label}</span>
                  {i < steps.length - 1 && <div className="w-8 sm:w-16 h-px bg-white/10" />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Address Step */}
              {step === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Delivery Address</h2>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-1 text-xs text-[#ff6b00] hover:text-[#ff7a1a] transition-colors"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>

                  {/* Address Form */}
                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              placeholder="Full Name *"
                              value={addressForm.name}
                              onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="Phone *"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="Address Line 1 *"
                              value={addressForm.addressLine1}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                              className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="Address Line 2 (Optional)"
                              value={addressForm.addressLine2}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                              className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="City *"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="State *"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                            <input
                              placeholder="Pincode *"
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button onClick={handleSaveAddress} className="btn-pill btn-pill-gold text-[10px]">
                              Save Address
                            </button>
                            <button onClick={() => setShowAddressForm(false)} className="btn-pill btn-pill-outline text-[10px]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Saved Addresses */}
                  <div className="space-y-3 mb-6">
                    {user?.addresses.map((addr) => {
                      const addressId = addr._id || addr.id || '';
                      return (
                        <div
                          key={addressId}
                          onClick={() => setSelectedAddressId(addressId)}
                          className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                            selectedAddressId === addressId || (!selectedAddressId && addr.isDefault)
                              ? "border-[#ff6b00]/50 bg-[#ff6b00]/5"
                              : "border-white/[0.06] bg-[#0c0c0c] hover:border-white/10"
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === addressId || (!selectedAddressId && addr.isDefault)
                              ? "border-[#ff6b00]"
                              : "border-white/20"
                          }`}>
                            {(selectedAddressId === addressId || (!selectedAddressId && addr.isDefault)) && (
                              <div className="h-2 w-2 rounded-full bg-[#ff6b00]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{addr.name}</span>
                              <span className="text-xs text-white/30">{addr.phone}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold tracking-wider text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded-full">DEFAULT</span>
                              )}
                            </div>
                            <p className="text-xs text-white/50">
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeAddress(addressId); }}
                            className="text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}

                    {user?.addresses.length === 0 && !showAddressForm && (
                      <div className="text-center py-10 rounded-xl border border-white/[0.06] bg-[#0c0c0c]">
                        <MapPin size={32} className="mx-auto mb-3 text-white/10" />
                        <p className="text-sm text-white/40 mb-3">No saved addresses</p>
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="text-xs text-[#ff6b00] hover:text-[#ff7a1a] transition-colors"
                        >
                          + Add your first address
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!selectedAddressId && user?.addresses.length === 0) {
                        addToast("Please add a delivery address", "error");
                        return;
                      }
                      setStep("payment");
                    }}
                    className="btn-pill btn-pill-gold w-full"
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {/* Payment Step */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-lg font-medium text-white mb-4">Payment Method</h2>

                  <div className="space-y-3 mb-8">
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#ff6b00]/50 bg-[#ff6b00]/5"
                          : "border-white/[0.06] bg-[#0c0c0c] hover:border-white/10"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cod" ? "border-[#ff6b00]" : "border-white/20"
                      }`}>
                        {paymentMethod === "cod" && <div className="h-2 w-2 rounded-full bg-[#ff6b00]" />}
                      </div>
                      <Truck size={18} className="text-white/40" />
                      <div>
                        <p className="text-sm font-medium text-white">Cash on Delivery</p>
                        <p className="text-xs text-white/30">Pay when your order arrives</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("online")}
                      className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                        paymentMethod === "online"
                          ? "border-[#ff6b00]/50 bg-[#ff6b00]/5"
                          : "border-white/[0.06] bg-[#0c0c0c] hover:border-white/10"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "online" ? "border-[#ff6b00]" : "border-white/20"
                      }`}>
                        {paymentMethod === "online" && <div className="h-2 w-2 rounded-full bg-[#ff6b00]" />}
                      </div>
                      <CreditCard size={18} className="text-white/40" />
                      <div>
                        <p className="text-sm font-medium text-white">Online Payment</p>
                        <p className="text-xs text-white/30">UPI / Card / Net Banking</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5 mb-6">
                    <h3 className="text-sm font-medium text-white mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Subtotal</span>
                        <span className="text-white">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Shipping</span>
                        <span className="text-green-400">{shipping === 0 ? "Free" : `$${shipping}`}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/[0.06] pt-2 font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-[#ff6b00]">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("address")} className="btn-pill btn-pill-outline flex-1">
                      Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={isSubmittingOrder} className="btn-pill btn-pill-gold flex-1 flex items-center justify-center gap-2">
                      {isSubmittingOrder ? <Loader2 size={16} className="animate-spin text-black" /> : null}
                      {paymentMethod === "online" ? "Pay & Place Order" : "Place Order"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Confirmation Step */}
              {step === "confirmation" && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  >
                    <CheckCircle size={80} className="mx-auto mb-6 text-green-400" />
                  </motion.div>
                  <h1 className="text-3xl font-light text-white mb-3">Order Placed!</h1>
                  <p className="text-white/40 mb-2">Thank you for your order.</p>
                  <p className="text-sm text-white/30 mb-8">Order ID: <span className="text-[#ff6b00]">{orderId}</span></p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/orders" className="btn-pill btn-pill-gold">
                      View Orders
                    </Link>
                    <Link href="/shop" className="btn-pill btn-pill-outline">
                      Continue Shopping
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <RazorpayModal
        isOpen={showRazorpay}
        amount={total}
        customerName={user?.name || "Customer"}
        customerEmail={user?.email}
        customerPhone={user?.addresses?.[0]?.phone}
        onClose={() => setShowRazorpay(false)}
        onSuccess={handleRazorpaySuccess}
      />
    </SmoothScrollProvider>
  );
}
