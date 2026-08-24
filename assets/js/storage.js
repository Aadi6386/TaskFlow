/* =========================================================
   TASKFLOW
   Local Storage — v2.0.0
========================================================= */

const STORAGE_KEY = "taskflow_tasks_v2";

const THEME_KEY = "taskflow_theme_v2";

const CATEGORY_KEY = "taskflow_categories_v2";

const CATEGORY_COLORS = [
    "purple", "blue", "green", "orange", "pink"
];


function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsed =
            JSON.parse(savedTasks);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .filter(task =>
                task &&
                typeof task === "object" &&
                typeof task.id === "string" &&
                typeof task.title === "string"
            )
            .map(task => ({
                id: task.id,
                title: task.title,
                description:
                    typeof task.description === "string"
                        ? task.description
                        : "",
                priority:
                    ["low", "medium", "high"]
                        .includes(task.priority)
                        ? task.priority
                        : "medium",
                date:
                    typeof task.date === "string"
                        ? task.date
                        : "",
                category:
                    typeof task.category === "string"
                        ? task.category
                        : "",
                completed:
                    Boolean(task.completed),
                important:
                    Boolean(task.important),
                createdAt:
                    task.createdAt ||
                    new Date().toISOString(),
                updatedAt:
                    task.updatedAt ||
                    task.createdAt ||
                    new Date().toISOString()
            }));

    } catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        return [];
    }
}


function saveTasks(tasks) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save tasks:",
            error
        );

        return false;
    }
}


function loadTheme() {

    try {

        const theme =
            localStorage.getItem(THEME_KEY);

        return theme === "light"
            ? "light"
            : "dark";

    } catch (error) {

        return "dark";
    }
}


function saveTheme(theme) {

    try {

        localStorage.setItem(
            THEME_KEY,
            theme
        );

    } catch (error) {

        console.error(
            "Unable to save theme:",
            error
        );
    }
}


function loadCategories() {

    try {

        const saved =
            localStorage.getItem(
                CATEGORY_KEY
            );

        if (!saved) {
            return null;
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return null;
        }

        const categories = parsed
            .filter(category =>
                category &&
                typeof category === "object" &&
                typeof category.id === "string" &&
                typeof category.name === "string" &&
                category.name.trim()
            )
            .map(category => ({
                id: category.id,
                name: category.name.trim(),
                color: CATEGORY_COLORS.includes(category.color)
                    ? category.color
                    : "purple"
            }));

        return categories.length > 0 ? categories : null;

    } catch (error) {

        console.error(
            "Unable to load categories:",
            error
        );

        return null;
    }
}


function saveCategories(categories) {

    try {

        localStorage.setItem(
            CATEGORY_KEY,
            JSON.stringify(categories)
        );

    } catch (error) {

        console.error(
            "Unable to save categories:",
            error
        );
    }
}


function clearStoredTasks() {

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to clear tasks:",
            error
        );

        return false;
    }
}
