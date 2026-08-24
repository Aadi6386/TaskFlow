/* =========================================================
   TASKFLOW
   Application State — v2.0.0
========================================================= */

const AppState = {

    tasks: [],

    categories: [
        {
            id: "college",
            name: "College",
            color: "purple"
        },
        {
            id: "personal",
            name: "Personal",
            color: "blue"
        },
        {
            id: "projects",
            name: "Projects",
            color: "green"
        }
    ],

    currentView: "today",

    searchQuery: "",

    categoryFilter: "",

    theme: "dark",

    editingTaskId: null,

    activeFilter: "all",

    sortBy: "created-desc",

    pendingAction: null

};
