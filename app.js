/* =========================================================
   SPORTSVN - APPLICATION
   Chức năng giao diện cơ bản
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       MOBILE MENU
       ================================ */

    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.querySelector(".sidebar");

    if (mobileMenu && sidebar) {
        mobileMenu.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }


    /* ================================
       ĐÓNG MENU KHI CHỌN MỤC
       ================================ */

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        item.addEventListener("click", () => {

            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            if (window.innerWidth <= 900 && sidebar) {
                sidebar.classList.remove("mobile-open");
            }
        });
    });


    /* ================================
       CÁC NÚT THAO TÁC NHANH
       ================================ */

    const quickActions = document.querySelectorAll(".quick-action");

    quickActions.forEach((button) => {

        button.addEventListener("click", () => {

            const title = button.querySelector("strong");

            if (!title) {
                return;
            }

            const action = title.textContent.trim();

            console.log("SportsVN:", action);

        });

    });


    /* ================================
       NÚT TẠO GIẢI ĐẤU
       ================================ */

    const createButtons = document.querySelectorAll(".primary-button");

    createButtons.forEach((button) => {

        button.addEventListener("click", () => {

            console.log("SportsVN: Mở chức năng tạo giải đấu");

        });

    });


    /* ================================
       THÔNG BÁO
       ================================ */

    const notificationButton = document.querySelector(
        '.icon-button[title="Thông báo"]'
    );

    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            console.log("SportsVN: Mở thông báo");

        });

    }


    /* ================================
       TÌM KIẾM
       ================================ */

    const searchButton = document.querySelector(
        '.icon-button[title="Tìm kiếm"]'
    );

    if (searchButton) {

        searchButton.addEventListener("click", () => {

            console.log("SportsVN: Mở tìm kiếm");

        });

    }


    /* ================================
       HIỂN THỊ TRẠNG THÁI ỨNG DỤNG
       ================================ */

    console.log("SportsVN đã khởi động thành công.");

});
