import {RouterProvider, createBrowserRouter, Navigate} from "react-router-dom"
import { useAuth } from "./providers/AuthProvider"
import { ProtectedRoute } from "./ProtectedRoute"
import HomePage from "../features/HomePage.jsx"
import LoginPage from "../features/auth/pages/LoginPage.jsx"
import RegisterPage from "../features/auth/pages/RegisterPage.jsx"
import LogoutPage from "../features/auth/pages/LogoutPage.jsx"
import {useEffect, useState} from "react"
import axios from "axios"
import CreateForm from "../features/household/components/forms/CreateForm.jsx"
import JoinForm from "../features/household/components/forms/JoinForm.jsx"
import DashboardPage from "../features/household/pages/DashboardPage.jsx"
import api from "./http.js"
import HouseholdListPage from "../features/household/pages/HouseholdListPage.jsx";
import ExpenseForm from "../features/household/components/forms/ExpenseForm.jsx";
import ViewExpensesPage from "../features/household/pages/ViewExpensesPage.jsx";
import SettleHistoryPage from "../features/household/pages/SettleHistoryPage.jsx";
import SettlePage from "../features/household/pages/SettlePage.jsx";

const Routes = () => {

    const publicRoutes = [
        { path: "/", element: <HomePage /> },
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
    ];

    const authedRoutes = [
        {
            path: "/app",
            element: <ProtectedRoute />,
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> }, // dashboard by default if authenticated
                { path: "dashboard", element: <DashboardPage /> },
                { path: "create-house", element: <CreateForm /> },
                { path: "join-house", element: <JoinForm /> },
                { path: "logout", element: <LogoutPage /> },
                { path: "house-list", element: <HouseholdListPage />},
                { path: "create-expense", element: <ExpenseForm />},
                { path: "my-expenses", element: <ViewExpensesPage />},
                { path: "settle", element: <SettlePage /> },
                { path: "settle-history", element: <SettleHistoryPage />}
            ],
        },
    ]

    const router = createBrowserRouter([
        ...publicRoutes,
        ...authedRoutes,
        { path: "*", element: <Navigate to="/" replace /> }, // fallback to home otherwise
    ])

    return <RouterProvider router={router} />
}

export default Routes
