/* =========================================================
   TASKFLOW
   Utility Functions — v2.0.0
========================================================= */


/**
 * Generate a unique task/category ID.
 */
function generateId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDate() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/**
 * Format a date for display.
 */
function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );
}


/**
 * Determine whether a date is overdue.
 */
function isOverdue(dateString) {

    if (!dateString) {
        return false;
    }

    return (
        dateString <
        getTodayDate()
    );
}


/**
 * Get current greeting.
 */
function getGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    if (hour < 21) {
        return "Good evening";
    }

    return "Good night";
}


/**
 * Format current date.
 */
function formatCurrentDate() {

    return new Date()
        .toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        )
        .toUpperCase();
}


/**
 * Escape HTML to prevent unsafe markup.
 */
function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}


/**
 * Show toast notification.
 */
function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);
}


/**
 * Sort tasks.
 */
function sortTasks(tasks, sortBy) {

    const sorted = [...tasks];

    switch (sortBy) {

        case "created-asc":

            return sorted.sort(
                (a, b) =>
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
            );


        case "priority":

            const priorityOrder = {
                high: 1,
                medium: 2,
                low: 3
            };

            return sorted.sort(
                (a, b) =>
                    priorityOrder[a.priority] -
                    priorityOrder[b.priority]
            );


        case "date-asc":

            return sorted.sort(
                (a, b) => {

                    if (!a.date) return 1;
                    if (!b.date) return -1;

                    return a.date.localeCompare(
                        b.date
                    );
                }
            );


        case "title":

            return sorted.sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );


        case "created-desc":
        default:

            return sorted.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );
    }
}


/**
 * Find a category.
 */
function getCategoryById(id) {

    return AppState.categories.find(
        category =>
            category.id === id
    );
}


/**
 * Get category display name.
 */
function getCategoryName(id) {

    const category =
        getCategoryById(id);

    return category
        ? category.name
        : "";
}


/**
 * Register the service worker.
 */
function registerServiceWorker() {

    if (
        window.location.protocol !== "file:" &&
        window.location.protocol !== "data:" &&
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register(
                        "service-worker.js"
                    )
                    .then(() => {

                        console.log(
                            "TaskFlow service worker registered."
                        );

                    })
                    .catch(() => {

                        console.error(
                            "TaskFlow offline support is unavailable."
                        );

                    });

            }
        );
    }
}
