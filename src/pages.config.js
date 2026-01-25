import ClientDashboard from './pages/ClientDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import Home from './pages/Home';
import ManagerCalendar from './pages/ManagerCalendar';
import ManagerClients from './pages/ManagerClients';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerFinancials from './pages/ManagerFinancials';
import ManagerLogin from './pages/ManagerLogin';
import ManagerLogistics from './pages/ManagerLogistics';
import ManagerProfile from './pages/ManagerProfile';
import ManagerPurchases from './pages/ManagerPurchases';
import ManagerSalesQuotes from './pages/ManagerSalesQuotes';
import ManagerSupplierQuotes from './pages/ManagerSupplierQuotes';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierLogin from './pages/SupplierLogin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ClientDashboard": ClientDashboard,
    "ClientLogin": ClientLogin,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleDetail": ClientVehicleDetail,
    "Home": Home,
    "ManagerCalendar": ManagerCalendar,
    "ManagerClients": ManagerClients,
    "ManagerDashboard": ManagerDashboard,
    "ManagerFinancials": ManagerFinancials,
    "ManagerLogin": ManagerLogin,
    "ManagerLogistics": ManagerLogistics,
    "ManagerProfile": ManagerProfile,
    "ManagerPurchases": ManagerPurchases,
    "ManagerSalesQuotes": ManagerSalesQuotes,
    "ManagerSupplierQuotes": ManagerSupplierQuotes,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
}

export const pagesConfig = {
    mainPage: "ManagerLogin",
    Pages: PAGES,
    Layout: __Layout,
};