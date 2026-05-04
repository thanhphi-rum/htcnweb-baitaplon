// ===== HÀM DÙNG CHUNG CHO TẤT CẢ CÁC TRANG =====

// Giỏ hàng - localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}
function updateBadge() {
    var cart = getCart();
    var totalQty = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalQty;
}

// Kiểm tra đăng nhập - navbar
function checkLogin() {
    var user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        var navLogin = document.getElementById("nav-login");
        var navUser = document.getElementById("nav-user");
        var userName = document.getElementById("user-name");
        if(navLogin) navLogin.classList.add("d-none");
        if(navUser) navUser.classList.remove("d-none");
        if(userName) userName.textContent = user.fullname || user.username;
    } else {
        var navLogin = document.getElementById("nav-login");
        var navUser = document.getElementById("nav-user");
        if(navLogin) navLogin.classList.remove("d-none");
        if(navUser) navUser.classList.add("d-none");
    }
}

// Thêm vào giỏ hàng (dùng cho homepage & produce)
function initAddToCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(function(btn) {
        if (btn.dataset.init) return;
        btn.dataset.init = "true";
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = this.dataset.id;
            var name = this.dataset.name;
            var price = parseInt(this.dataset.price);
            var img = this.dataset.img;
            var cart = getCart();
            var existing = cart.find(function(item) { return item.id === id; });
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ id: id, name: name, price: price, img: img, qty: 1 });
            }
            saveCart(cart);
            updateBadge();
            var original = this.textContent;
            this.textContent = '✓ Đã thêm!';
            this.classList.replace('btn-success', 'btn-secondary');
            var self = this;
            setTimeout(function() {
                self.textContent = original;
                self.classList.replace('btn-secondary', 'btn-success');
            }, 1200);
        });
    });
}

// Điều hướng sang chi tiết sản phẩm (dùng cho homepage & produce)
function initProductLinks() {
    document.querySelectorAll('#product-list .card, .row .card').forEach(function(card) {
        var addBtn = card.querySelector('.btn-add-cart');
        if (!addBtn) return;
        var productId = addBtn.dataset.id;
        var image = card.querySelector('img');
        var title = card.querySelector('h6');
        function goToDetail() {
            window.location.href = 'detail.html?id=' + productId;
        }
        if (image && !image.dataset.init) { 
            image.dataset.init = "true";
            image.style.cursor = 'pointer'; 
            image.addEventListener('click', goToDetail); 
        }
        if (title && !title.dataset.init) { 
            title.dataset.init = "true";
            title.style.cursor = 'pointer'; 
            title.classList.add('text-success'); 
            title.addEventListener('click', goToDetail); 
        }
    });
}

// ===== TRANG SẢN PHẨM (PRODUCE) =====
function filterProducts() {
    var priceEl = document.getElementById('filter-price');
    if (!priceEl) return;
    var priceValue = priceEl.value;
    var brandValue = document.getElementById('filter-brand').value;
    var saleValue  = document.getElementById('filter-sale').value;
    var searchEl = document.getElementById('search-input');
    var keyword = searchEl ? searchEl.value.toLowerCase() : "";
    var typeValue = document.getElementById('filter-type').value;
    var buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(function(btn) {
        var product = btn.closest('.col-lg-3, .col-md-4');
        if (!product) return;
        var price = parseInt(btn.dataset.price);
        var brand = btn.dataset.brand;
        var sale  = btn.dataset.sale;
        var name  = btn.dataset.name.toLowerCase();
        var type  = btn.dataset.type;
        var show = true;
        if (keyword && !name.includes(keyword)) show = false;
        if (priceValue == "1" && !(price <= 10000)) show = false;
        if (priceValue == "2" && !(price > 10000 && price <= 20000)) show = false;
        if (priceValue == "3" && !(price > 20000 && price <= 30000)) show = false;
        if (priceValue == "4" && !(price > 30000 && price <= 50000)) show = false;
        if (priceValue == "5" && !(price > 50000)) show = false;
        if (saleValue === "yes" && sale == 0) show = false;
        if (saleValue === "no" && sale > 0) show = false;
        if (typeValue && typeValue !== "0" && type !== typeValue) show = false;
        if (brandValue && brandValue !== "0" && brand !== brandValue) show = false;
        product.style.display = show ? "block" : "none";
    });
}

// ===== TRANG GIỎ HÀNG =====
function renderCart() {
    var container = document.getElementById('cart-items');
    if (!container) return;
    var cart = getCart();
    var emptyMsg  = document.getElementById('cart-empty');
    var summary   = document.getElementById('cart-summary');
    container.innerHTML = '';
    if (cart.length === 0) {
        if(emptyMsg) emptyMsg.classList.remove('d-none');
        if(summary) summary.classList.add('d-none');
        var cartTotal = document.getElementById('cart-total');
        if(cartTotal) cartTotal.textContent = '0đ';
        updateBadge();
        return;
    }
    if(emptyMsg) emptyMsg.classList.add('d-none');
    if(summary) summary.classList.remove('d-none');
    var total = 0;
    cart.forEach(function(item) {
        var subtotal = item.price * item.qty;
        total += subtotal;
        var row = document.createElement('div');
        row.className = 'row align-items-center border rounded mt-3 mb-2 py-3 shadow-sm bg-white';
        row.innerHTML =
            '<div class="col-md-2 text-center"><img src="' + item.img + '" class="img-fluid" style="max-width:100px;" alt="' + item.name + '"></div>' +
            '<div class="col-md-3 text-center"><h6 class="mb-0">' + item.name + '</h6></div>' +
            '<div class="col-md-2 text-center text-primary fw-bold"><span>' + formatPrice(item.price) + '</span></div>' +
            '<div class="col-md-2"><div class="input-group input-group-sm w-75 mx-auto">' +
            '<button class="btn btn-outline-secondary btn-decrease" onclick="changeQty(\'' + item.id + '\', -1)">-</button>' +
            '<input type="text" class="form-control text-center" value="' + item.qty + '" readonly>' +
            '<button class="btn btn-outline-secondary btn-increase" onclick="changeQty(\'' + item.id + '\', 1)">+</button></div></div>' +
            '<div class="col-md-2 text-center fw-bold text-danger"><span>' + formatPrice(subtotal) + '</span></div>' +
            '<div class="col-md-1 text-center"><button class="btn btn-link text-danger p-0 btn-remove" onclick="removeItem(\'' + item.id + '\')" title="Xóa"><img class="w-50" src="../icon/icons8-trash-48.png" alt="Xóa"></button></div>';
        container.appendChild(row);
    });
    var cartTotal = document.getElementById('cart-total');
    if(cartTotal) cartTotal.textContent = formatPrice(total);
    updateBadge();
}
window.changeQty = function(id, delta) {
    var cart = getCart();
    var item = cart.find(function(i) { return i.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { cart = cart.filter(function(i) { return i.id !== id; }); }
    saveCart(cart);
    renderCart();
};
window.removeItem = function(id) {
    var cart = getCart().filter(function(i) { return i.id !== id; });
    saveCart(cart);
    renderCart();
};

// ===== TRANG CHI TIẾT SẢN PHẨM =====
var detailProducts = {
    sp001: { id: "sp001", name: "Rau muống 300g", price: 19000, oldPrice: 27000, sale: 30, brand: "Organic", unit: "300g", origin: "TP.HCM", img: "../img/raumuong.jpg", description: "Rau muống non, giòn ngọt, phù hợp luộc hoặc xào tỏi." },
    sp002: { id: "sp002", name: "Bông cải", price: 25000, oldPrice: 0, sale: 0, brand: "Organic", unit: "500g", origin: "Đà Lạt", img: "../img/cai.jpg", description: "Bông cải xanh tươi, giàu vitamin, thích hợp nấu súp và xào." },
    sp003: { id: "sp003", name: "Cà rốt 300gr", price: 18000, oldPrice: 0, sale: 0, brand: "Organic", unit: "300g", origin: "Đà Lạt", img: "../img/carot.jpg", description: "Cà rốt ngọt, chắc củ, phù hợp ăn sống và chế biến món hầm." },
    sp004: { id: "sp004", name: "Khổ qua 300gr", price: 30000, oldPrice: 0, sale: 0, brand: "Organic", unit: "300g", origin: "Long An", img: "../img/khoqua.jpg", description: "Khổ qua tươi, vị đắng nhẹ, phù hợp nhồi thịt hoặc xào trứng." },
    sp005: { id: "sp005", name: "Mồng tơi 300gr", price: 9500, oldPrice: 19500, sale: 49, brand: "Organic", unit: "300g", origin: "Củ Chi", img: "../img/mongtoi.jpg", description: "Mồng tơi lá xanh mướt, phù hợp nấu canh giải nhiệt." },
    sp006: { id: "sp006", name: "Táo 1kg", price: 50000, oldPrice: 0, sale: 0, brand: "Organic", unit: "1kg", origin: "Ninh Thuận", img: "../img/táo.jpg", description: "Táo giòn ngọt tự nhiên, phù hợp ăn trực tiếp hoặc ép nước." },
    sp007: { id: "sp007", name: "Bí đỏ 1kg", price: 40000, oldPrice: 0, sale: 0, brand: "Organic", unit: "1kg", origin: "Lâm Đồng", img: "../img/bi-do.jpg", description: "Bí đỏ dẻo thơm, phù hợp nấu cháo, nấu canh và làm bánh." },
    sp008: { id: "sp008", name: "Rau đền 300gr", price: 8000, oldPrice: 16000, sale: 50, brand: "Organic", unit: "300g", origin: "Long An", img: "../img/rauden.jpg", description: "Rau dền đỏ tươi, giàu sắt, thích hợp nấu canh." },
    sp009: { id: "sp009", name: "Rau tần 300gr", price: 17000, oldPrice: 0, sale: 0, brand: "Organic", unit: "300g", origin: "Bình Dương", img: "../img/rautan.jpg", description: "Rau tần thơm nhẹ, thường dùng nấu canh thịt bằm." },
    sp010: { id: "sp010", name: "Rau lang 300gr", price: 9500, oldPrice: 19500, sale: 49, brand: "Organic", unit: "300g", origin: "Củ Chi", img: "../img/rau_lang.png", description: "Rau lang non, giòn, ngon khi luộc hoặc xào tỏi." },
    sp011: { id: "sp011", name: "Cam 1kg", price: 29000, oldPrice: 0, sale: 0, brand: "Organic", unit: "1kg", origin: "Vĩnh Long", img: "../img/cam.jpg", description: "Cam mọng nước, vị ngọt thanh, giàu vitamin C." },
    sp012: { id: "sp012", name: "Dưa lưới 1kg", price: 69000, oldPrice: 119000, sale: 42, brand: "Organic", unit: "1kg", origin: "Ninh Thuận", img: "../img/dua_luoi.png", description: "Dưa lưới thơm ngọt, thịt dày, thích hợp tráng miệng." },
    sp013: { id: "sp013", name: "Rau ngót 300g", price: 13000, oldPrice: 0, sale: 0, brand: "Organic", unit: "300g", origin: "Hóc Môn", img: "../img/rau-ngot.jpg", description: "Rau ngót sạch, lá non, nấu canh tôm hoặc thịt rất ngon." },
    sp014: { id: "sp014", name: "Khoai tây 500g", price: 15000, oldPrice: 20000, sale: 25, brand: "Organic", unit: "500g", origin: "Đà Lạt", img: "../img/khoai-tay.jpg", description: "Khoai tây bở vừa, ngon khi chiên, hầm hoặc nướng." },
    sp015: { id: "sp015", name: "Khoai lang 500g", price: 20000, oldPrice: 0, sale: 0, brand: "Organic", unit: "500g", origin: "Đồng Nai", img: "../img/khoai-lang.jpg", description: "Khoai lang ngọt bùi, tốt cho sức khỏe và dễ chế biến." },
    sp016: { id: "sp016", name: "Rau răm 50g", price: 2500, oldPrice: 5000, sale: 50, brand: "Organic", unit: "50g", origin: "Cần Giờ", img: "../img/rau-ram.jpg", description: "Rau răm thơm nồng nhẹ, dùng kèm cháo và món gỏi." },
    sp017: { id: "sp017", name: "Rau muống 300g", price: 19000, oldPrice: 27000, sale: 30, brand: "Organic", unit: "300g", origin: "TP.HCM", img: "../img/raumuong.jpg", description: "Rau muống tươi sạch, phù hợp cho bữa cơm hằng ngày." },
    sp018: { id: "sp018", name: "Hành lá 300g", price: 18000, oldPrice: 0, sale: 0, brand: "Organic", unit: "300g", origin: "Long An", img: "../img/hanh-la.jpg", description: "Hành lá xanh tươi, thơm nhẹ, tiện dùng cho nhiều món ăn." }
};
function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("id") || "sp001").toLowerCase();
}
function renderProductDetail(product) {
    if (!document.getElementById("product-name")) return;
    document.title = product.name + " - Chi tiết sản phẩm";
    document.getElementById("product-breadcrumb").textContent = product.name;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-id").textContent = product.id.toUpperCase();
    document.getElementById("product-image").src = product.img;
    document.getElementById("product-image").alt = product.name;
    document.getElementById("product-price").textContent = formatPrice(product.price);
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-brand").textContent = "Thương hiệu: " + product.brand;
    document.getElementById("product-unit").textContent = "Đơn vị tính: " + product.unit;
    document.getElementById("product-origin").textContent = "Xuất xứ: " + product.origin;
    var oldPriceEl = document.getElementById("product-old-price");
    var saleBadgeEl = document.getElementById("product-sale-badge");
    if (product.oldPrice > 0 && product.sale > 0) {
        if(oldPriceEl) oldPriceEl.textContent = formatPrice(product.oldPrice);
        if(saleBadgeEl) saleBadgeEl.textContent = "-" + product.sale + "%";
    } else {
        if(oldPriceEl) oldPriceEl.textContent = "";
        if(saleBadgeEl) saleBadgeEl.textContent = "";
    }
}
function addDetailToCart(product, qty) {
    var cart = getCart();
    var existing = cart.find(function(item) { return item.id === product.id; });
    if (existing) { existing.qty += qty; }
    else { cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: qty }); }
    saveCart(cart);
    updateBadge();
}

// ===== TRANG THANH TOÁN =====
function checkHT() {
    var regex = /^[A-Z]{1}[a-z]*(\s[A-Z]{1}[a-z]*)+$/;
    var hoTen = document.getElementById("txtten").value;
    var errorElement = document.getElementById("Error_1");
    if(regex.test(hoTen)) { errorElement.innerHTML = "Họ và tên hợp lệ"; errorElement.style.color = "green"; return true; }
    else { errorElement.innerHTML = "Vui lòng nhập đúng họ tên"; errorElement.style.color = "red"; return false; }
}
function checkSDT() {
    var regex = /^(03|05|07|08|09)\d{8}$/;
    var sdt = document.getElementById("txtSDT").value;
    var errorElement = document.getElementById("Error_2");
    if(regex.test(sdt)) { errorElement.innerHTML = "Số điện thoại hợp lệ"; errorElement.style.color = "green"; return true; }
    else { errorElement.innerHTML = "Vui lòng nhập đúng số điện thoại"; errorElement.style.color = "red"; return false; }
}
function checkDC() {
    var regex = /^[A-Za-z0-9,.\ \s]+$/;
    var dc = document.getElementById("txtDC").value;
    var errorElement = document.getElementById("Error_3");
    if(regex.test(dc)) { errorElement.innerHTML = "Địa chỉ hợp lệ"; errorElement.style.color = "green"; return true; }
    else { errorElement.innerHTML = "Vui lòng nhập đúng địa chỉ"; errorElement.style.color = "red"; return false; }
}
function renderOrderSummary() {
    var container = document.getElementById('order-items');
    if (!container) return;
    var cart = getCart();
    var totalEl = document.getElementById('order-total');
    if (cart.length === 0) { container.innerHTML = '<p class="text-muted text-center">Giỏ hàng đang trống.</p>'; totalEl.textContent = '0đ'; return; }
    var total = 0; var html = '';
    cart.forEach(function(item) {
        var subtotal = item.price * item.qty; total += subtotal;
        html += '<div class="d-flex justify-content-between mb-2"><span>' + item.name + ' x' + item.qty + '</span><span>' + formatPrice(subtotal) + '</span></div>';
    });
    container.innerHTML = html;
    if(totalEl) totalEl.textContent = formatPrice(total);
}
function generateOrderId() { return 'DH' + Date.now().toString().slice(-6); }
function requireLogin() {
    var user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) { alert("Vui lòng đăng nhập trước!"); window.location.href = "login.html"; }
}
function loadUserInfoToForm() {
    var user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;
    var txtTen = document.getElementById("txtten");
    if(txtTen) txtTen.value = user.fullname || "";
    var txtSdt = document.getElementById("txtSDT");
    if(txtSdt) txtSdt.value = user.phone || "";
    var txtDc = document.getElementById("txtDC");
    if(txtDc) txtDc.value = user.address || "";
}

// ===== TRANG ĐĂNG NHẬP / ĐĂNG KÝ / QUÊN MẬT KHẨU / LOGIN =====
window.validateForm = function() {
    // Nếu có trường fullname => đang ở trang đăng ký
    if (document.getElementById('fullname')) {
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value;
        var fullname = document.getElementById("fullname").value.trim();
        var email    = document.getElementById("email").value.trim();
        var phone    = document.getElementById("phone").value.trim();
        var address  = document.getElementById("address").value.trim();
        var birthday = document.getElementById("birthday").value;
        
        document.getElementById("errName").innerHTML = "";
        document.getElementById("errPass").innerHTML = "";
        
        if (!username || !password || !fullname || !email || !phone) { 
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc!"); 
            return false; 
        }
        var usernameRegex = /^[a-zA-Z0-9]{6,}$/;
        if (!usernameRegex.test(username)) { 
            document.getElementById("errName").innerHTML = "Tên đăng nhập tối thiểu 6 ký tự, không dấu và không chứa ký tự đặc biệt!"; 
            document.getElementById("username").focus(); 
            return false; 
        }
        var users = JSON.parse(localStorage.getItem("users")) || [];
        var exists = users.find(function(u) { return u.username === username; });
        if (exists) { 
            document.getElementById("errName").innerHTML = "Tên đăng nhập này đã được sử dụng!"; 
            document.getElementById("username").focus(); 
            return false; 
        }
        var newUser = { username: username, password: password, fullname: fullname, email: email, phone: phone, address: address, birthday: birthday, avatar: "" };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        alert("Đăng ký thành công!");
        window.location.href = "login.html";
        return false;
    } 
    // Ngược lại, nếu ở trang đăng nhập
    else if (document.getElementById('name') && document.getElementById('pass')) {
        var username = document.getElementById("name").value.trim();
        var password = document.getElementById("pass").value;
        var users = JSON.parse(localStorage.getItem("users")) || [];
        var user = users.find(function(u) { return u.username === username && u.password === password; });
        if (!user) { alert("Sai tài khoản hoặc mật khẩu!"); return false; }
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert("Đăng nhập thành công!");
        window.location.href = "homepage.html";
        return false;
    }
    return false;
}

window.validateForgot = function() {
    var emailEl = document.getElementById("email");
    if(!emailEl) return false;
    var email = emailEl.value.trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    document.getElementById("errEmail").innerHTML = "";
    if (email === "") { document.getElementById("errEmail").innerHTML = "Vui lòng nhập email!"; document.getElementById("email").focus(); return false; }
    if (!emailRegex.test(email)) { document.getElementById("errEmail").innerHTML = "Email không đúng định dạng (vd: sv123@gmail.com)"; document.getElementById("email").focus(); return false; }
    alert("Yêu cầu thành công! Vui lòng kiểm tra hộp thư email của bạn.");
    window.location.href = "login.html";
    return false;
}

// ===== TRANG TIN TỨC =====
window.showModal = function(id) {
    var title = document.getElementById('modal-title');
    var content = document.getElementById('modal-content');
    if(!title || !content) return;
    if (id === 'detail1') {
        title.innerText = "Lợi ích khi ăn rau mỗi ngày";
        content.innerHTML = '<p>Rau giàu vitamin, khoáng chất và chất chống oxy hóa giúp bảo vệ sức khỏe tim mạch, làn da và ngăn ngừa bệnh mạn tính.</p>' +
            '<h6 class="fw-bold mt-3 text-success">1. Giảm nguy cơ mắc bệnh tim</h6><p>Rau giúp giảm cholesterol xấu, chống viêm và stress oxy hóa. Các loại như bắp cải, bông cải xanh chứa nhiều vitamin C, carotenoid hỗ trợ tim mạch.</p>' +
            '<h6 class="fw-bold mt-3 text-success">2. Duy trì làn da khỏe mạnh</h6><p>Vitamin C, beta-carotene giúp sản sinh collagen, làm chậm lão hóa và bảo vệ da khỏi tia UV.</p>' +
            '<h6 class="fw-bold mt-3 text-success">3. Tốt cho mắt</h6><p>Lutein và zeaxanthin giúp giảm nguy cơ thoái hóa điểm vàng và đục thủy tinh thể.</p>' +
            '<h6 class="fw-bold mt-3 text-success">4. Tăng cường miễn dịch</h6><p>Chất xơ trong rau giúp hệ tiêu hóa khỏe mạnh và tăng cường vi khuẩn có lợi.</p>' +
            '<h6 class="fw-bold mt-3 text-success">5. Giúp xương chắc khỏe</h6><p>Rau lá xanh cung cấp canxi, vitamin K, magie giúp xương chắc khỏe và ngăn ngừa loãng xương.</p>';
    }
    if (id === 'detail2') {
        title.innerText = "Cách chọn rau sạch đúng chuẩn";
        content.innerHTML = '<p>Để chọn rau sạch, an toàn và tươi ngon, bạn cần chú ý đến màu sắc, hình dáng và cảm giác khi cầm.</p>' +
            '<h6 class="fw-bold mt-3 text-success">1. Quan sát màu sắc và vẻ ngoài</h6><ul><li><b>Màu sắc:</b> Chọn rau có màu tự nhiên.</li><li><b>Hình dáng:</b> Tránh rau quá to, đều bất thường.</li><li><b>Sâu bệnh:</b> Rau sạch thường có vài lỗ sâu nhỏ.</li></ul>' +
            '<h6 class="fw-bold mt-3 text-success">2. Cảm nhận khi cầm nắm</h6><ul><li><b>Thân và lá:</b> Thân nhỏ, chắc, hơi dai.</li><li><b>Cuống rau:</b> Giòn, không héo hay thâm.</li></ul>' +
            '<h6 class="fw-bold mt-3 text-success">3. Mẹo chọn theo từng loại</h6><ul><li><b>Rau ăn lá:</b> Lá tươi, không dập.</li><li><b>Củ, quả:</b> Kích thước vừa phải.</li></ul>' +
            '<h6 class="fw-bold mt-3 text-success">4. Lưu ý khi mua</h6><ul><li>Mua rau đúng mùa.</li><li>Chọn nơi bán uy tín.</li></ul>' +
            '<div class="alert alert-success mt-3"><b>Kết luận:</b> Rau sạch không cần quá đẹp.</div>';
    }
    if (id === 'detail3') {
        title.innerText = "Thực phẩm sạch và sức khỏe";
        content.innerHTML = '<p>Thực phẩm sạch là nguồn thực phẩm an toàn, không chứa độc tố.</p>' +
            '<h6 class="fw-bold mt-3 text-success">1. Vai trò của thực phẩm sạch</h6><ul><li><b>Tăng cường đề kháng</b></li><li><b>Giảm gánh nặng cho cơ thể</b></li><li><b>Phát triển toàn diện</b></li><li><b>Phòng bệnh mãn tính</b></li></ul>' +
            '<h6 class="fw-bold mt-3 text-success">2. Tiêu chí nhận biết</h6><ul><li><b>Nguồn gốc rõ ràng</b></li><li><b>Tươi ngon tự nhiên</b></li><li><b>Quy trình an toàn</b></li></ul>' +
            '<h6 class="fw-bold mt-3 text-success">3. Cách lựa chọn</h6><ul><li>Mua tại siêu thị uy tín.</li><li>Ưu tiên thực phẩm theo mùa.</li><li>Rửa sạch trước khi dùng.</li></ul>' +
            '<div class="alert alert-success mt-3"><b>Kết luận:</b> Lựa chọn thực phẩm sạch là bước quan trọng.</div>';
    }
    var modalEl = document.getElementById('newsModal');
    if(modalEl && window.bootstrap) {
        var modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// ===== TRANG LỊCH SỬ ĐƠN HÀNG =====
function renderHistory() {
    var container = document.getElementById('order-list');
    if (!container) return;
    var orders = JSON.parse(localStorage.getItem('orders')) || [];
    var noOrders = document.getElementById('no-orders');
    if (orders.length === 0) { if(noOrders) noOrders.classList.remove('d-none'); return; }
    orders = orders.reverse();
    var html = '';
    orders.forEach(function(order) {
        var itemsHtml = '';
        order.cart.forEach(function(item) {
            itemsHtml += '<tr><td>' + item.name + '</td><td class="text-center">' + item.quantity + '</td><td class="text-end">' + formatPrice(item.price * item.quantity) + '</td></tr>';
        });
        var statusClass = 'bg-warning text-dark';
        if (order.status === 'Đã giao') statusClass = 'bg-success';
        if (order.status === 'Đã hủy') statusClass = 'bg-danger';
        html += '<div class="card shadow-sm mb-4"><div class="card-header bg-white d-flex justify-content-between align-items-center"><div><strong class="text-success">Đơn #' + order.id + '</strong><span class="badge ' + statusClass + ' ms-2">' + order.status + '</span></div><small class="text-muted">' + (order.date || '') + '</small></div>' +
            '<div class="card-body"><div class="row"><div class="col-md-6"><p class="mb-1"><strong>Người nhận:</strong> ' + order.customer.name + '</p><p class="mb-1"><strong>SĐT:</strong> ' + order.customer.phone + '</p><p class="mb-1"><strong>Địa chỉ:</strong> ' + order.customer.address + '</p><p class="mb-1"><strong>Thanh toán:</strong> ' + (order.payment === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản') + '</p>' +
            (order.customer.note ? '<p class="mb-0"><strong>Ghi chú:</strong> ' + order.customer.note + '</p>' : '') +
            '</div><div class="col-md-6"><table class="table table-sm mb-0"><thead><tr><th>Sản phẩm</th><th class="text-center">SL</th><th class="text-end">Thành tiền</th></tr></thead><tbody>' + itemsHtml + '</tbody><tfoot><tr class="fw-bold"><td colspan="2">Tổng cộng</td><td class="text-end text-success">' + formatPrice(order.total) + '</td></tr></tfoot></table></div></div></div></div>';
    });
    container.innerHTML = html;
}

// ===== TRANG PROFILE =====
function loadProfile() {
    var fullnameEl = document.getElementById('fullname');
    if (!fullnameEl) return;
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { alert("Bạn chưa đăng nhập!"); window.location.href = "login.html"; return; }
    fullnameEl.value = user.fullname || "";
    var bd = document.getElementById('birthday'); if(bd) bd.value = user.birthday || "";
    var em = document.getElementById('email'); if(em) em.value = user.email || "";
    var ph = document.getElementById('phone'); if(ph) ph.value = user.phone || "";
    var ad = document.getElementById('address'); if(ad) ad.value = user.address || "";
    var av = document.getElementById('avatar');
    if (user.avatar && av) { av.src = user.avatar; }
}
window.saveProfile = function() {
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) return;
    user.fullname = document.getElementById('fullname').value;
    user.birthday = document.getElementById('birthday').value;
    user.email    = document.getElementById('email').value;
    user.phone    = document.getElementById('phone').value;
    user.address  = document.getElementById('address').value;
    localStorage.setItem('currentUser', JSON.stringify(user));
    var users = JSON.parse(localStorage.getItem('users')) || [];
    var index = users.findIndex(function(u) { return u.username === user.username; });
    if (index !== -1) { users[index] = user; localStorage.setItem('users', JSON.stringify(users)); }
    alert("Cập nhật thành công!");
}
window.logout = function() {
    localStorage.removeItem("currentUser");
    alert("Đã đăng xuất!");
    window.location.href = "homepage.html";
}


// ==========================================
// KHỞI CHẠY KHI TẢI XONG DOM
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Luôn chạy trên tất cả các trang
    updateBadge();
    checkLogin();
    initAddToCartButtons();
    initProductLinks();

    // Trang Produce
    var filterPrice = document.getElementById('filter-price');
    if (filterPrice) {
        filterPrice.addEventListener('change', filterProducts);
        var fBrand = document.getElementById('filter-brand'); if(fBrand) fBrand.addEventListener('change', filterProducts);
        var fSale = document.getElementById('filter-sale'); if(fSale) fSale.addEventListener('change', filterProducts);
        var fType = document.getElementById('filter-type'); if(fType) fType.addEventListener('change', filterProducts);
        var sBtn = document.getElementById('search-btn'); if(sBtn) sBtn.addEventListener('click', filterProducts);
        
        var params = new URLSearchParams(window.location.search);
        var typeParam = params.get("type");
        if (typeParam && fType) {
            fType.value = typeParam;
            filterProducts();
        }
    }

    // Trang Cart
    var cartItems = document.getElementById('cart-items');
    if (cartItems) {
        renderCart();
        var orderBtn = document.getElementById('btn-order');
        if (orderBtn) {
            orderBtn.addEventListener('click', function() {
                var cart = getCart();
                if (cart.length === 0) { alert('Giỏ hàng đang trống!'); return; }
                window.location.href = 'payment.html';
            });
        }
    }

    // Trang Chi tiết sản phẩm
    var detailName = document.getElementById('product-name');
    var btnAddCartDetail = document.getElementById('btn-add-cart'); // ID đặc biệt ở trang detail
    if (detailName && btnAddCartDetail) {
        var productId = getProductIdFromUrl();
        var product = detailProducts[productId] || detailProducts.sp001;
        var qty = 1;
        renderProductDetail(product);
        
        var qtyInput = document.getElementById("qty-input");
        var msg = document.getElementById("add-cart-message");
        var btnPlus = document.getElementById("btn-qty-plus");
        var btnMinus = document.getElementById("btn-qty-minus");
        
        if(btnPlus) btnPlus.addEventListener("click", function () { qty += 1; if(qtyInput) qtyInput.value = qty; });
        if(btnMinus) btnMinus.addEventListener("click", function () { if (qty > 1) qty -= 1; if(qtyInput) qtyInput.value = qty; });
        
        btnAddCartDetail.addEventListener("click", function (e) {
            e.preventDefault(); e.stopPropagation();
            addDetailToCart(product, qty);
            if(msg) {
                msg.textContent = "Đã thêm " + qty + " sản phẩm vào giỏ hàng";
                setTimeout(function () { msg.textContent = ""; }, 1500);
            }
        });
    }

    // Trang Thanh toán
    var paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        loadUserInfoToForm();
        renderOrderSummary();
        requireLogin();
        
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var cart = getCart();
            if (cart.length === 0) { alert('Giỏ hàng đang trống, không thể đặt hàng!'); return; }
            var validHT = checkHT(); var validSDT = checkSDT(); var validDC = checkDC();
            if (!validHT || !validSDT || !validDC) return;
            var name = document.getElementById('txtten').value.trim();
            var phone = document.getElementById('txtSDT').value.trim();
            var address = document.getElementById('txtDC').value.trim();
            var txtGh = document.getElementById('txtGH');
            var note = txtGh ? txtGh.value.trim() : "";
            var payment = document.querySelector('input[name="payment"]:checked');
            if (!payment) { alert('Vui lòng chọn phương thức thanh toán!'); return; }
            var total = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
            var order = { id: generateOrderId(), customer: { name: name, phone: phone, address: address, note: note }, payment: payment.value,
                cart: cart.map(function(item) { return { name: item.name, price: item.price, quantity: item.qty }; }), total: total };
            localStorage.setItem('order', JSON.stringify(order));
            var orders = JSON.parse(localStorage.getItem('orders')) || [];
            order.date = new Date().toLocaleString('vi-VN'); order.status = 'Đang xử lý';
            orders.push(order); localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.removeItem('cart');
            window.location.href = 'success.html';
        });
        
        var txtTen = document.getElementById('txtten'); if(txtTen) txtTen.addEventListener('blur', checkHT);
        var txtSdt = document.getElementById('txtSDT'); if(txtSdt) txtSdt.addEventListener('blur', checkSDT);
        var txtDc = document.getElementById('txtDC'); if(txtDc) txtDc.addEventListener('blur', checkDC);
    }

    // Trang Success
    if (window.location.pathname.includes('success.html')) {
        var order = JSON.parse(localStorage.getItem("order"));
        var successContainer = document.querySelector(".container.my-5 .card");
        if(successContainer) {
            if(order){
                var productList = "";
                order.cart.forEach(function(item) {
                    productList += '<li class="list-group-item d-flex justify-content-between"><span>' + item.name + ' (x' + item.quantity + ')</span><span>' + (item.price * item.quantity).toLocaleString() + 'đ</span></li>';
                });
                successContainer.innerHTML = '<h2 class="text-success mb-3"><i class="bi bi-check-circle-fill"></i> Đặt hàng thành công!</h2>' +
                    '<p class="mb-4">Cảm ơn bạn đã tin tưởng và mua hàng tại Rau Sạch.</p>' +
                    '<p><strong>Mã đơn:</strong> ' + order.id + '</p>' +
                    '<p><strong>Khách hàng:</strong> ' + order.customer.name + '</p>' +
                    '<p><strong>Phương thức thanh toán:</strong> ' + (order.payment === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản') + '</p>' +
                    '<ul class="list-group mb-3">' + productList + '</ul>' +
                    '<h5 class="text-danger text-end">Tổng tiền: ' + order.total.toLocaleString() + 'đ</h5>' +
                    '<a href="homepage.html" class="btn btn-success mt-3">Quay về trang chủ</a>';
                localStorage.removeItem("order");
            } else {
                successContainer.innerHTML = '<h2 class="text-danger mb-3"><i class="bi bi-x-circle-fill"></i> Không có đơn hàng!</h2>' +
                    '<p>Bạn không có đơn hàng hợp lệ để thanh toán.</p>' +
                    '<a href="homepage.html" class="btn btn-secondary mt-3">Quay về trang chủ</a>';
            }
        }
    }

    // Trang History
    var historyList = document.getElementById('order-list');
    if (historyList) {
        renderHistory();
    }

    // Trang Profile
    var profileName = document.getElementById('fullname');
    if (profileName && window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
});
