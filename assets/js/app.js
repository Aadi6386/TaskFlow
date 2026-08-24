/* =========================================================
   TASKFLOW
   Application Controller — v2.0.0
========================================================= */


/* =========================================================
   DOM REFERENCES
========================================================= */

const elements = {
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyDescription: document.getElementById("emptyDescription"),

    taskModal: document.getElementById("taskModal"),
    taskForm: document.getElementById("taskForm"),
    addTaskButton: document.getElementById("addTaskButton"),
    emptyAddTaskButton: document.getElementById("emptyAddTaskButton"),
    closeModalButton: document.getElementById("closeModalButton"),
    cancelTaskButton: document.getElementById("cancelTaskButton"),

    taskTitle: document.getElementById("taskTitle"),
    taskDescription: document.getElementById("taskDescription"),
    taskPriority: document.getElementById("taskPriority"),
    taskDate: document.getElementById("taskDate"),
    taskCategory: document.getElementById("taskCategory"),

    searchInput: document.getElementById("searchInput"),

    themeToggle: document.getElementById("themeToggle"),

    mobileMenu: document.getElementById("mobileMenu"),
    sidebar: document.getElementById("sidebar"),
    sidebarOverlay: document.getElementById("sidebarOverlay"),

    totalTasks: document.getElementById("totalTasks"),
    completedTasks: document.getElementById("completedTasks"),
    remainingTasks: document.getElementById("remainingTasks"),
    progressPercentage: document.getElementById("progressPercentage"),
    progressRing: document.getElementById("progressRing"),

    taskCount: document.getElementById("taskCount"),
    taskViewTitle: document.getElementById("taskViewTitle"),
    currentDate: document.getElementById("currentDate"),
    greeting: document.getElementById("greeting"),

    categories: document.getElementById("categories"),
    addCategoryButton: document.getElementById("addCategoryButton"),

    categoryModal: document.getElementById("categoryModal"),
    categoryForm: document.getElementById("categoryForm"),
    categoryName: document.getElementById("categoryName"),
    categoryColor: document.getElementById("categoryColor"),
    closeCategoryModalButton:
        document.getElementById("closeCategoryModalButton"),
    cancelCategoryButton:
        document.getElementById("cancelCategoryButton"),

    filterButton: document.getElementById("filterButton"),
    filterPanel: document.getElementById("filterPanel"),
    sortButton: document.getElementById("sortButton"),

    settingsModal: document.getElementById("settingsModal"),
    closeSettingsModalButton:
        document.getElementById("closeSettingsModalButton"),
    settingsThemeButton:
        document.getElementById("settingsThemeButton"),
    clearTasksButton:
        document.getElementById("clearTasksButton"),

    profileButton: document.getElementById("profileButton"),

    confirmModal: document.getElementById("confirmModal"),
    confirmMessage: document.getElementById("confirmMessage"),
    closeConfirmModalButton:
        document.getElementById("closeConfirmModalButton"),
    cancelConfirmButton:
        document.getElementById("cancelConfirmButton"),
    confirmActionButton:
        document.getElementById("confirmActionButton")
};


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {
    const savedCategories = loadCategories();

    if (savedCategories) {
        AppState.categories = savedCategories;
    }

    AppState.tasks = loadTasks();
    AppState.theme = loadTheme();

    applyTheme();
    updateHeader();
    bindEvents();

    renderCategories();
    renderCategoryOptions();
    updateCategorySelection();

    render();

    /*
     * registerServiceWorker() is provided by utils.js.
     * It safely avoids registration on file:// pages.
     */
    registerServiceWorker();
}


document.addEventListener("DOMContentLoaded", init);


/* =========================================================
   EVENT BINDING
========================================================= */

function bindEvents() {

    /*
     * IMPORTANT:
     * Do NOT pass openTaskModal directly as the handler.
     * The browser passes the MouseEvent as the first argument,
     * which would incorrectly be treated as a task ID.
     */
    elements.addTaskButton.addEventListener(
        "click",
        () => openTaskModal()
    );

    elements.emptyAddTaskButton.addEventListener(
        "click",
        () => openTaskModal()
    );

    elements.closeModalButton.addEventListener(
        "click",
        closeTaskModal
    );

    elements.cancelTaskButton.addEventListener(
        "click",
        closeTaskModal
    );

    elements.taskForm.addEventListener(
        "submit",
        handleTaskSubmit
    );

    elements.searchInput.addEventListener(
        "input",
        handleSearch
    );

    elements.themeToggle.addEventListener(
        "click",
        toggleTheme
    );

    elements.mobileMenu.addEventListener(
        "click",
        toggleSidebar
    );

    elements.sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );


    /* -----------------------------------------------------
       NAVIGATION
    ----------------------------------------------------- */

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const view = button.dataset.view;

            if (!view) {
                return;
            }

            if (view === "settings") {
                openSettingsModal();
                closeSidebar();
                return;
            }

            AppState.currentView = view;
            AppState.categoryFilter = "";

            updateCategorySelection();
            updateActiveNavigation(button);

            closeSidebar();
            render();

        });

    });


    /* -----------------------------------------------------
       CATEGORIES
    ----------------------------------------------------- */

    elements.addCategoryButton.addEventListener(
        "click",
        openCategoryModal
    );

    elements.categoryForm.addEventListener(
        "submit",
        handleCategorySubmit
    );

    elements.closeCategoryModalButton.addEventListener(
        "click",
        closeCategoryModal
    );

    elements.cancelCategoryButton.addEventListener(
        "click",
        closeCategoryModal
    );


    /* -----------------------------------------------------
       FILTERS
    ----------------------------------------------------- */

    elements.filterButton.addEventListener(
        "click",
        toggleFilterPanel
    );

    document.querySelectorAll(".filter-option").forEach(button => {

        button.addEventListener("click", () => {

            AppState.activeFilter =
                button.dataset.filter || "all";

            updateActiveFilter(button);
            render();

        });

    });


    /* -----------------------------------------------------
       SORTING
    ----------------------------------------------------- */

    elements.sortButton.addEventListener(
        "click",
        cycleSort
    );


    /* -----------------------------------------------------
       SETTINGS
    ----------------------------------------------------- */

    elements.closeSettingsModalButton.addEventListener(
        "click",
        closeSettingsModal
    );

    elements.settingsThemeButton.addEventListener(
        "click",
        toggleTheme
    );

    elements.clearTasksButton.addEventListener(
        "click",
        confirmClearTasks
    );


    /* -----------------------------------------------------
       PROFILE
    ----------------------------------------------------- */

    elements.profileButton.addEventListener(
        "click",
        () => {
            showToast(
                "TaskFlow — Personal Productivity"
            );
        }
    );


    /* -----------------------------------------------------
       CONFIRMATION MODAL
    ----------------------------------------------------- */

    elements.closeConfirmModalButton.addEventListener(
        "click",
        closeConfirmModal
    );

    elements.cancelConfirmButton.addEventListener(
        "click",
        closeConfirmModal
    );

    elements.confirmActionButton.addEventListener(
        "click",
        executePendingAction
    );


    /* -----------------------------------------------------
       BACKDROP CLOSE
    ----------------------------------------------------- */

    [
        elements.taskModal,
        elements.categoryModal,
        elements.settingsModal,
        elements.confirmModal
    ].forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                closeSpecificModal(modal);
            }

        });

    });


    /* -----------------------------------------------------
       KEYBOARD SHORTCUTS
    ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        handleKeyboardShortcuts
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function updateActiveNavigation(activeButton) {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {
            button.classList.remove("active");
        });

    activeButton.classList.add("active");
}


function updateActiveFilter(activeButton) {

    document
        .querySelectorAll(".filter-option")
        .forEach(button => {
            button.classList.remove("active");
        });

    activeButton.classList.add("active");
}


/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    elements.currentDate.textContent =
        formatCurrentDate();

    elements.greeting.innerHTML =
        `${getGreeting()}, Aaditya <span class="wave">👋</span>`;
}


/* =========================================================
   SIDEBAR
========================================================= */

function toggleSidebar() {

    const open =
        elements.sidebar.classList.toggle("open");

    elements.sidebarOverlay.classList.toggle(
        "open",
        open
    );

    elements.mobileMenu.setAttribute(
        "aria-expanded",
        String(open)
    );
}


function closeSidebar() {

    elements.sidebar.classList.remove("open");

    elements.sidebarOverlay.classList.remove(
        "open"
    );

    elements.mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );
}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.dataset.triggerId =
        document.activeElement?.id || "";

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    const triggerId =
        modal.dataset.triggerId;

    if (!triggerId) {
        return;
    }

    const trigger =
        document.getElementById(triggerId);

    if (trigger) {
        trigger.focus();
    }
}


function closeSpecificModal(modal) {

    if (modal === elements.taskModal) {
        closeTaskModal();
        return;
    }

    if (modal === elements.categoryModal) {
        closeCategoryModal();
        return;
    }

    if (modal === elements.settingsModal) {
        closeSettingsModal();
        return;
    }

    if (modal === elements.confirmModal) {
        closeConfirmModal();
        return;
    }

    closeModal(modal);
}


/* =========================================================
   TASK MODAL
========================================================= */

function openTaskModal(taskId = null) {

    AppState.editingTaskId = taskId;

    elements.taskForm.reset();

    renderCategoryOptions();


    /* -----------------------------------------------------
       EDIT EXISTING TASK
    ----------------------------------------------------- */

    if (taskId) {

        const task =
            AppState.tasks.find(
                item => item.id === taskId
            );

        if (!task) {
            AppState.editingTaskId = null;

            showToast(
                "That task could not be found."
            );

            return;
        }

        document.getElementById(
            "modalTitle"
        ).textContent = "Edit task";

        document.getElementById(
            "saveTaskButton"
        ).textContent = "Update task";

        elements.taskTitle.value =
            task.title;

        elements.taskDescription.value =
            task.description;

        elements.taskPriority.value =
            task.priority;

        elements.taskDate.value =
            task.date;

        elements.taskCategory.value =
            task.category || "";

    }


    /* -----------------------------------------------------
       CREATE NEW TASK
    ----------------------------------------------------- */

    else {

        document.getElementById(
            "modalTitle"
        ).textContent = "Create a task";

        document.getElementById(
            "saveTaskButton"
        ).textContent = "Save task";

        elements.taskDate.value =
            getTodayDate();
    }


    openModal(elements.taskModal);

    window.setTimeout(() => {
        elements.taskTitle.focus();
    }, 100);
}


function closeTaskModal() {

    closeModal(elements.taskModal);

    AppState.editingTaskId = null;
}


/* =========================================================
   TASK CREATION / EDITING
========================================================= */

function handleTaskSubmit(event) {

    event.preventDefault();

    const title =
        elements.taskTitle.value.trim();

    const description =
        elements.taskDescription.value.trim();

    const priority =
        elements.taskPriority.value || "medium";

    const date =
        elements.taskDate.value;

    const category =
        elements.taskCategory.value;


    if (!title) {

        showToast(
            "Please enter a task."
        );

        elements.taskTitle.focus();

        return;
    }


    /* -----------------------------------------------------
       EDIT
    ----------------------------------------------------- */

    if (AppState.editingTaskId) {

        const task =
            AppState.tasks.find(
                item =>
                    item.id ===
                    AppState.editingTaskId
            );

        if (!task) {

            showToast(
                "Unable to update this task."
            );

            closeTaskModal();

            return;
        }

        task.title = title;
        task.description = description;
        task.priority = priority;
        task.date = date;
        task.category = category;

        /*
         * Preserve the user's explicit important state
         * unless the priority changes to high.
         */
        task.important =
            priority === "high"
                ? true
                : Boolean(task.important);

        task.updatedAt =
            new Date().toISOString();

        saveTasks(AppState.tasks);

        closeTaskModal();

        render();

        showToast(
            "Task updated successfully."
        );

        return;
    }


    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

    const now =
        new Date().toISOString();

    const task = {
        id: generateId(),
        title,
        description,
        priority,
        date,
        category,
        completed: false,
        important: priority === "high",
        createdAt: now,
        updatedAt: now
    };


    AppState.tasks.push(task);

    saveTasks(AppState.tasks);

    closeTaskModal();

    render();

    showToast(
        "Task created successfully."
    );
}


/* =========================================================
   SEARCH
========================================================= */

function handleSearch(event) {

    AppState.searchQuery =
        event.target.value
            .trim()
            .toLowerCase();

    render();
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    AppState.theme =
        AppState.theme === "dark"
            ? "light"
            : "dark";

    saveTheme(AppState.theme);

    applyTheme();

    showToast(
        AppState.theme === "dark"
            ? "Dark mode enabled."
            : "Light mode enabled."
    );
}


function applyTheme() {

    document.documentElement.dataset.theme =
        AppState.theme;

    elements.themeToggle.textContent =
        AppState.theme === "dark"
            ? "☼"
            : "☾";

    elements.themeToggle.setAttribute(
        "aria-label",
        AppState.theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
    );
}


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

    renderTasks();

    updateStatistics();

    updateViewTitle();
}


/* =========================================================
   TASK FILTERING
========================================================= */

function getVisibleTasks() {

    let tasks = [
        ...AppState.tasks
    ];


    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (AppState.searchQuery) {

        tasks =
            tasks.filter(task => {

                const title =
                    String(task.title || "")
                        .toLowerCase();

                const description =
                    String(task.description || "")
                        .toLowerCase();

                const category =
                    getCategoryName(
                        task.category
                    ).toLowerCase();

                return (
                    title.includes(
                        AppState.searchQuery
                    ) ||
                    description.includes(
                        AppState.searchQuery
                    ) ||
                    category.includes(
                        AppState.searchQuery
                    )
                );
            });
    }


    /* -----------------------------------------------------
       MAIN VIEW
    ----------------------------------------------------- */

    switch (AppState.currentView) {

        case "completed":

            tasks =
                tasks.filter(
                    task => task.completed
                );

            break;


        case "important":

            tasks =
                tasks.filter(
                    task =>
                        task.important &&
                        !task.completed
                );

            break;


        case "upcoming":

            tasks =
                tasks.filter(
                    task =>
                        task.date &&
                        task.date >
                            getTodayDate() &&
                        !task.completed
                );

            break;


        case "today":

        default:

            tasks =
                tasks.filter(
                    task =>
                        !task.completed &&
                        (
                            !task.date ||
                            task.date ===
                                getTodayDate()
                        )
                );

            break;
    }


    /* -----------------------------------------------------
       PRIORITY / DATE FILTER
    ----------------------------------------------------- */

    switch (AppState.activeFilter) {

        case "high":
        case "medium":
        case "low":

            tasks =
                tasks.filter(
                    task =>
                        task.priority ===
                        AppState.activeFilter
                );

            break;


        case "with-date":

            tasks =
                tasks.filter(
                    task =>
                        Boolean(task.date)
                );

            break;


        case "all":
        default:
            break;
    }


    /* -----------------------------------------------------
       CATEGORY FILTER
    ----------------------------------------------------- */

    if (AppState.categoryFilter) {

        tasks =
            tasks.filter(
                task =>
                    task.category ===
                    AppState.categoryFilter
            );
    }


    return sortTasks(
        tasks,
        AppState.sortBy
    );
}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {

    const tasks =
        getVisibleTasks();

    elements.taskList.innerHTML = "";


    if (tasks.length === 0) {

        elements.taskList.style.display =
            "none";

        elements.emptyState.style.display =
            "flex";

        updateEmptyState();

        return;
    }


    elements.taskList.style.display =
        "flex";

    elements.emptyState.style.display =
        "none";


    tasks.forEach(task => {

        const article =
            document.createElement("article");

        article.className =
            "task-item";

        if (task.completed) {
            article.classList.add(
                "completed"
            );
        }


        /* -------------------------------------------------
           CHECKBOX
        ------------------------------------------------- */

        const checkbox =
            document.createElement("button");

        checkbox.type = "button";

        checkbox.className =
            "task-checkbox";

        if (task.completed) {
            checkbox.classList.add(
                "checked"
            );
        }

        checkbox.dataset.complete =
            task.id;

        checkbox.setAttribute(
            "aria-label",
            task.completed
                ? "Reopen task"
                : "Complete task"
        );


        /* -------------------------------------------------
           CONTENT
        ------------------------------------------------- */

        const content =
            document.createElement("div");

        content.className =
            "task-content";


        const title =
            document.createElement("div");

        title.className =
            "task-title";

        title.textContent =
            task.title;

        content.appendChild(title);


        if (task.description) {

            const description =
                document.createElement("div");

            description.className =
                "task-description";

            description.textContent =
                task.description;

            content.appendChild(
                description
            );
        }


        /* -------------------------------------------------
           META
        ------------------------------------------------- */

        const meta =
            document.createElement("div");

        meta.className =
            "task-meta";


        const priority =
            document.createElement("span");

        priority.className =
            `priority ${task.priority}`;

        priority.textContent =
            task.priority;

        meta.appendChild(priority);


        if (task.category) {

            const category =
                document.createElement("span");

            category.className =
                "task-category";

            category.textContent =
                getCategoryName(
                    task.category
                );

            meta.appendChild(category);
        }


        if (task.date) {

            const date =
                document.createElement("span");

            date.className =
                "task-date";

            if (
                isOverdue(task.date) &&
                !task.completed
            ) {

                date.classList.add(
                    "overdue"
                );

                date.textContent =
                    `Overdue · ${formatDate(task.date)}`;

            } else {

                date.textContent =
                    formatDate(task.date);
            }

            meta.appendChild(date);
        }


        content.appendChild(meta);


        /* -------------------------------------------------
           ACTIONS
        ------------------------------------------------- */

        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";


        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className = "icon-button";
        editButton.textContent = "✎";
        editButton.title = "Edit task";
        editButton.setAttribute(
            "aria-label",
            "Edit task"
        );
        editButton.dataset.edit =
            task.id;


        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "icon-button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute(
            "aria-label",
            "Delete task"
        );
        deleteButton.dataset.delete =
            task.id;


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        /* -------------------------------------------------
           ASSEMBLE
        ------------------------------------------------- */

        article.appendChild(checkbox);
        article.appendChild(content);
        article.appendChild(actions);

        elements.taskList.appendChild(article);
    });


    bindTaskActions();
}


/* =========================================================
   EMPTY STATE
========================================================= */

function updateEmptyState() {

    if (AppState.searchQuery) {

        elements.emptyTitle.textContent =
            "No matching tasks";

        elements.emptyDescription.textContent =
            "Try a different search term or clear your search.";

        elements.emptyAddTaskButton.style.display =
            "none";

        return;
    }


    elements.emptyAddTaskButton.style.display =
        "inline-flex";


    switch (AppState.currentView) {

        case "completed":

            elements.emptyTitle.textContent =
                "Nothing completed yet";

            elements.emptyDescription.textContent =
                "Completed tasks will appear here.";

            return;


        case "upcoming":

            elements.emptyTitle.textContent =
                "No upcoming tasks";

            elements.emptyDescription.textContent =
                "You're clear for the days ahead.";

            return;


        case "important":

            elements.emptyTitle.textContent =
                "No important tasks";

            elements.emptyDescription.textContent =
                "High-priority tasks will appear here.";

            return;


        case "today":

        default:

            elements.emptyTitle.textContent =
                "You're all caught up";

            elements.emptyDescription.textContent =
                "No tasks here yet. Add something to keep your day moving.";

            return;
    }
}


/* =========================================================
   TASK ACTIONS
========================================================= */

function bindTaskActions() {

    document
        .querySelectorAll("[data-complete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    completeTask(
                        button.dataset.complete
                    );
                }
            );

        });


    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    openTaskModal(
                        button.dataset.edit
                    );
                }
            );

        });


    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    confirmDeleteTask(
                        button.dataset.delete
                    );
                }
            );

        });
}


/* =========================================================
   COMPLETE TASK
========================================================= */

function completeTask(id) {

    const task =
        AppState.tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }

    task.completed =
        !task.completed;

    task.updatedAt =
        new Date().toISOString();

    saveTasks(AppState.tasks);

    render();

    showToast(
        task.completed
            ? "Task completed."
            : "Task reopened."
    );
}


/* =========================================================
   DELETE TASK
========================================================= */

function confirmDeleteTask(id) {

    const task =
        AppState.tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }

    AppState.pendingAction = {
        type: "delete-task",
        id
    };

    elements.confirmMessage.textContent =
        `Delete "${task.title}"? This action cannot be undone.`;

    openModal(
        elements.confirmModal
    );
}


function deleteTask(id) {

    AppState.tasks =
        AppState.tasks.filter(
            task => task.id !== id
        );

    saveTasks(
        AppState.tasks
    );

    render();

    showToast(
        "Task deleted."
    );
}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        AppState.tasks.length;

    const completed =
        AppState.tasks.filter(
            task => task.completed
        ).length;

    const remaining =
        total - completed;

    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    elements.totalTasks.textContent =
        total;

    elements.completedTasks.textContent =
        completed;

    elements.remainingTasks.textContent =
        remaining;

    elements.progressPercentage.textContent =
        `${progress}%`;

    elements.progressRing.classList.toggle(
        "complete",
        progress === 100 &&
            total > 0
    );


    const visibleCount =
        getVisibleTasks().length;

    elements.taskCount.textContent =
        `${visibleCount} ${
            visibleCount === 1
                ? "task"
                : "tasks"
        }`;
}


/* =========================================================
   VIEW TITLE
========================================================= */

function updateViewTitle() {

    const titles = {
        today: "Today's tasks",
        upcoming: "Upcoming tasks",
        important: "Important tasks",
        completed: "Completed tasks"
    };

    elements.taskViewTitle.textContent =
        titles[AppState.currentView] ||
        "Today's tasks";
}


/* =========================================================
   SORTING
========================================================= */

function cycleSort() {

    const sorts = [
        "created-desc",
        "created-asc",
        "priority",
        "date-asc",
        "title"
    ];

    const labels = {
        "created-desc": "Newest first",
        "created-asc": "Oldest first",
        "priority": "Priority",
        "date-asc": "Due date",
        "title": "Title"
    };

    const currentIndex =
        sorts.indexOf(
            AppState.sortBy
        );

    const nextIndex =
        (
            currentIndex + 1
        ) % sorts.length;

    AppState.sortBy =
        sorts[nextIndex];

    render();

    showToast(
        `Sorted by ${labels[AppState.sortBy]}.`
    );
}


/* =========================================================
   FILTER PANEL
========================================================= */

function toggleFilterPanel() {

    const isHidden =
        elements.filterPanel.hidden;

    elements.filterPanel.hidden =
        !isHidden;

    elements.filterButton.setAttribute(
        "aria-expanded",
        String(isHidden)
    );
}


/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {

    elements.categories.innerHTML = "";

    AppState.categories.forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "category-item";

        button.dataset.category =
            category.id;

        button.setAttribute(
            "aria-pressed",
            "false"
        );


        const dot =
            document.createElement("span");

        dot.className =
            `category-dot ${category.color}`;


        const name =
            document.createElement("span");

        name.textContent =
            category.name;


        button.appendChild(dot);
        button.appendChild(name);


        button.addEventListener(
            "click",
            () => {

                /*
                 * Clicking the currently selected category
                 * clears the category filter.
                 */
                if (
                    AppState.categoryFilter ===
                    category.id
                ) {

                    AppState.categoryFilter = "";

                    updateCategorySelection();

                    render();

                    showToast(
                        "Category filter cleared."
                    );

                    return;
                }

                AppState.categoryFilter =
                    category.id;

                updateCategorySelection();

                render();

                showToast(
                    `Showing ${category.name} tasks.`
                );
            }
        );


        elements.categories.appendChild(
            button
        );

    });

    updateCategorySelection();
}


function updateCategorySelection() {

    document
        .querySelectorAll(".category-item")
        .forEach(item => {

            const active =
                item.dataset.category ===
                AppState.categoryFilter;

            item.classList.toggle(
                "active",
                active
            );

            item.setAttribute(
                "aria-pressed",
                String(active)
            );

        });
}


/* =========================================================
   CATEGORY OPTIONS
========================================================= */

function renderCategoryOptions() {

    elements.taskCategory.innerHTML = "";

    const none =
        document.createElement("option");

    none.value = "";

    none.textContent =
        "No category";

    elements.taskCategory.appendChild(
        none
    );


    AppState.categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        elements.taskCategory.appendChild(
            option
        );

    });
}


/* =========================================================
   CATEGORY MODAL
========================================================= */

function openCategoryModal() {

    elements.categoryForm.reset();

    openModal(
        elements.categoryModal
    );

    window.setTimeout(() => {
        elements.categoryName.focus();
    }, 100);
}


function closeCategoryModal() {

    closeModal(
        elements.categoryModal
    );
}


function handleCategorySubmit(event) {

    event.preventDefault();

    const name =
        elements.categoryName.value.trim();

    const color =
        elements.categoryColor.value;


    if (!name) {

        showToast(
            "Please enter a category name."
        );

        elements.categoryName.focus();

        return;
    }


    const duplicate =
        AppState.categories.some(
            category =>
                category.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        showToast(
            "That category already exists."
        );

        elements.categoryName.focus();

        return;
    }


    AppState.categories.push({

        id: generateId(),

        name,

        color

    });


    saveCategories(
        AppState.categories
    );

    renderCategories();

    renderCategoryOptions();

    closeCategoryModal();

    showToast(
        "Category added."
    );
}


/* =========================================================
   SETTINGS
========================================================= */

function openSettingsModal() {

    openModal(
        elements.settingsModal
    );
}


function closeSettingsModal() {

    closeModal(
        elements.settingsModal
    );
}


function confirmClearTasks() {

    if (AppState.tasks.length === 0) {

        showToast(
            "There are no tasks to clear."
        );

        return;
    }


    AppState.pendingAction = {
        type: "clear-tasks"
    };


    elements.confirmMessage.textContent =
        "This will permanently remove all locally stored tasks.";


    openModal(
        elements.confirmModal
    );
}


/* =========================================================
   CONFIRMATION
========================================================= */

function closeConfirmModal() {

    closeModal(
        elements.confirmModal
    );

    AppState.pendingAction = null;
}


function executePendingAction() {

    const action =
        AppState.pendingAction;


    if (!action) {

        closeConfirmModal();

        return;
    }


    if (
        action.type ===
        "delete-task"
    ) {

        deleteTask(
            action.id
        );
    }


    if (
        action.type ===
        "clear-tasks"
    ) {

        AppState.tasks = [];

        clearStoredTasks();

        render();

        showToast(
            "All tasks cleared."
        );
    }


    closeConfirmModal();
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function handleKeyboardShortcuts(event) {

    const modifier =
        event.metaKey ||
        event.ctrlKey;


    /* -----------------------------------------------------
       SEARCH — Cmd/Ctrl + K
    ----------------------------------------------------- */

    if (
        modifier &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        elements.searchInput.focus();

        return;
    }


    /* -----------------------------------------------------
       NEW TASK — Cmd/Ctrl + N
    ----------------------------------------------------- */

    if (
        modifier &&
        event.key.toLowerCase() === "n"
    ) {

        event.preventDefault();

        openTaskModal();

        return;
    }


    /* -----------------------------------------------------
       ESCAPE
    ----------------------------------------------------- */

    if (event.key === "Escape") {

        if (
            elements.taskModal.classList.contains(
                "open"
            )
        ) {
            closeTaskModal();
        }

        if (
            elements.categoryModal.classList.contains(
                "open"
            )
        ) {
            closeCategoryModal();
        }

        if (
            elements.settingsModal.classList.contains(
                "open"
            )
        ) {
            closeSettingsModal();
        }

        if (
            elements.confirmModal.classList.contains(
                "open"
            )
        ) {
            closeConfirmModal();
        }

        closeSidebar();
    }
}
