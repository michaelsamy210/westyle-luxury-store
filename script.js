document.addEventListener("DOMContentLoaded", () => {
  const cursorGlow = document.getElementById('cursorGlow');
  window.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = `${e.clientX - 200}px`;
      cursorGlow.style.top = `${e.clientY - 200}px`;
    }
  });

  window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (scrollBtn) {
      if (window.scrollY > 500) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    }
  });
});

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme');
}

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const hamburgerIcon = document.getElementById("hamburgerIcon");
  if (navLinks && hamburgerIcon) {
    navLinks.classList.toggle("open");
    hamburgerIcon.classList.toggle("open");
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterProducts(category, buttonContext) {
  const cards = document.querySelectorAll('.card');
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  buttonContext.classList.add('active');

  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

let globalCartState = [];
let promoCodeActivated = false;

// تحديث الفتح ليبدأ دائماً من خطوة المنتجات الأولى
function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  switchCartStep(1); 
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

// دالة التنقل التبادلي بين خطوات تابات السلة (المنتجات / الفورم)
function switchCartStep(stepNumber) {
  const step1 = document.getElementById("cartStep1");
  const step2 = document.getElementById("cartStep2");
  const tabBtn1 = document.getElementById("tabBtn1");
  const tabBtn2 = document.getElementById("tabBtn2");

  if (!step1 || !step2) return;

  if (stepNumber === 1) {
    step1.classList.add("active");
    step2.classList.remove("active");
    if (tabBtn1) tabBtn1.classList.add("active");
    if (tabBtn2) tabBtn2.classList.remove("active");
  } else {
    if (globalCartState.length === 0) {
      alert("سلتك فارغة حالياً، أضف منتجات أولاً!");
      return;
    }
    step1.classList.remove("active");
    step2.classList.add("active");
    if (tabBtn1) tabBtn1.classList.remove("active");
    if (tabBtn2) tabBtn2.classList.add("active");
  }
}

function handlePaymentMethodChange() {
  const paymentMethod = document.getElementById("paymentMethod").value;
  const instapayAlert = document.getElementById("instapayAlert");
  if (instapayAlert) {
    instapayAlert.style.display = (paymentMethod === "InstaPay") ? "block" : "none";
  }
}

function addCardToCart(buttonContext, productName, productPrice) {
  const rootCard = buttonContext.closest('.card');
  const size = rootCard.querySelector('.size-select').value;
  const color = rootCard.querySelector('.color-select').value;
  const productImgSrc = rootCard.querySelector('.product-src-img').src;
  
  const itemId = `${productName}-${size}-${color}`;
  const existingItem = globalCartState.find(item => item.id === itemId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    globalCartState.push({ 
      id: itemId, 
      name: productName, 
      price: parseInt(productPrice), 
      size: size, 
      color: color, 
      image: productImgSrc,
      quantity: 1 
    });
  }
  
  refreshCartInterface();
  openCart();
}

function changeItemQuantityState(itemId, increment) {
  const item = globalCartState.find(item => item.id === itemId);
  if (!item) return;
  item.quantity += increment;
  if (item.quantity <= 0) {
    globalCartState = globalCartState.filter(i => i.id !== itemId);
  }
  refreshCartInterface();
}

function completelyRemoveCartItem(itemId) {
  globalCartState = globalCartState.filter(item => item.id !== itemId);
  refreshCartInterface();
}

function applyDiscountCoupon() {
  const input = document.getElementById("couponInput").value.trim();
  const feedback = document.getElementById("couponFeedback");
  
  if (!feedback) return;

  if (input === "WESTYLE10") {
    promoCodeActivated = true;
    feedback.innerText = "🎉 تم تطبيق خصم 10% بنجاح!";
    feedback.style.color = "#00cd52";
  } else {
    promoCodeActivated = false;
    feedback.innerText = "❌ كود الخصم غير صحيح";
    feedback.style.color = "#ff3b30";
  }
  calculateCartTotals();
}

// دالة الحسابات الشاملة والمؤمنة من أخطاء عدم وجود العناصر في الـ DOM
function calculateCartTotals() {
  let subtotal = 0;
  globalCartState.forEach(item => { 
    subtotal += parseInt(item.price) * parseInt(item.quantity); 
  });
  
  let discount = promoCodeActivated ? (subtotal * 0.10) : 0;
  
  const selector = document.getElementById("shippingLocation");
  let shippingFee = 0;
  if (selector && globalCartState.length > 0) {
    shippingFee = parseInt(selector.options[selector.selectedIndex].getAttribute('data-fee')) || 0;
  }

  const discountRow = document.getElementById("discountRow");
  if (discountRow) {
    if (promoCodeActivated && subtotal > 0) {
      discountRow.style.display = "flex";
      const billDiscountEl = document.getElementById("billDiscount");
      if (billDiscountEl) billDiscountEl.innerText = `-${discount.toFixed(0)} LE`;
    } else {
      discountRow.style.display = "none";
    }
  }

  let finalGrandTotal = subtotal - discount + shippingFee;

  // تحديث التوتال الفرعي للخطوة الأولى الخاصة بالمنتجات فقط
  const step1SubtotalEl = document.getElementById("step1Subtotal");
  if (step1SubtotalEl) step1SubtotalEl.innerText = `${subtotal} LE`;

  // تحديث قيم الفاتورة الكاملة في خطوة البيانات الثانية (إن وجدت)
  const billSubtotalEl = document.getElementById("billSubtotal");
  const billShippingEl = document.getElementById("billShipping");
  const billTotalEl = document.getElementById("billTotal");

  if (billSubtotalEl) billSubtotalEl.innerText = `${subtotal} LE`;
  if (billShippingEl) billShippingEl.innerText = `${shippingFee} LE`;
  if (billTotalEl) billTotalEl.innerText = `${finalGrandTotal} LE`;
}

function refreshCartInterface() {
  const container = document.getElementById("cartItemsContainer");
  const badge = document.getElementById("cartCount");
  if (!container) return;
  
  container.innerHTML = "";
  let totalQty = 0;

  if (globalCartState.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg">YOUR CART IS CURRENTLY EMPTY</div>`;
    if (badge) badge.innerText = "0";
    calculateCartTotals();
    return;
  }

  globalCartState.forEach(item => {
    totalQty += item.quantity;
    
    // كود بناء الكارت بالهيكل المطور لتكبير مساحة العرض والصورة بالتساوي
    container.innerHTML += `
      <div class="cart-premium-item">
        <div class="cart-item-img-wrapper">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-header">
            <span class="item-title-text">${item.name}</span>
            <button type="button" class="item-remove-x" onclick="completelyRemoveCartItem('${item.id}')">✕</button>
          </div>
          <div class="cart-item-meta">
            <span>Size: <strong>${item.size}</strong></span>
            <span>Color: <strong>${item.color}</strong></span>
          </div>
          <div class="cart-item-footer">
            <span class="item-price-text">${item.price * item.quantity} LE</span>
            <div class="item-qty-widget">
              <button type="button" onclick="changeItemQuantityState('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button type="button" onclick="changeItemQuantityState('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  if (badge) badge.innerText = totalQty;
  calculateCartTotals();
}

function executeWhatsAppCheckout() {
  if (globalCartState.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const notes = document.getElementById("custNotes").value.trim() || "لا يوجد";
  const pMethod = document.getElementById("paymentMethod").value;

  if (!name || !phone || !address) {
    alert("برجاء ملء جميع الحقول الإجبارية (*)");
    return;
  }

  const selector = document.getElementById("shippingLocation");
  const shippingLabel = selector.options[selector.selectedIndex].text;
  const shippingFee = parseInt(selector.options[selector.selectedIndex].getAttribute('data-fee')) || 0;
  
  let msg = `🔥 طلب شراء جديد من براند westyle 🔥%0A%0A`;
  msg += `👤 بيانات العميل:%0A`;
  msg += `-----------------------------%0A`;
  msg += `📝 الاسم: ${name}%0A`;
  msg += `📞 الفون: ${phone}%0A`;
  msg += `📍 العنوان: ${address}%0A`;
  msg += `💳 الدفع عن طريق: ${pMethod}%0A`;
  msg += `✉️ ملاحظات: ${notes}%0A%0A`;
  
  msg += `🛒 المنتجات المطلوبة:%0A`;
  msg += `-----------------------------%0A`;
  
  let subtotal = 0;
  globalCartState.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    msg += `${i+1}. ${item.name}%0A`;
    msg += `   [المقاس: ${item.size} | اللون: ${item.color}]%0A`;
    msg += `   الكمية: ${item.quantity} × السعر: ${item.price} LE -> الإجمالي: ${itemTotal} LE%0A%0A`;
  });
  
  let discount = promoCodeActivated ? (subtotal * 0.10) : 0;
  let finalTotal = subtotal - discount + shippingFee;

  msg += `-----------------------------%0A`;
  msg += `💰 الحساب قبل الخصم: ${subtotal} LE%0A`;
  if (promoCodeActivated) {
    msg += `🎟️ قيمة الخصم المطبق (10%): -${discount.toFixed(0)} LE%0A`;
  }
  msg += `🚚 مصاريف الشحن (${shippingLabel}): ${shippingFee} LE%0A`;
  msg += `💵 صافي المبلغ المطلوب سداده: *${finalTotal} LE*%0A`;
  
  window.open(`https://wa.me/201122176987?text=${msg}`, "_blank");
}