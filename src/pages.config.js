import ClientDashboard from './pages/ClientDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import Home from './pages/Home';
import ManagerClients from './pages/ManagerClients';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerFinancials from './pages/ManagerFinancials';
import ManagerLogin from './pages/ManagerLogin';
import ManagerLogistics from './pages/ManagerLogistics';
import ManagerPurchases from './pages/ManagerPurchases';
import ManagerSalesQuotes from './pages/ManagerSalesQuotes';
import ManagerSupplierQuotes from './pages/ManagerSupplierQuotes';
import ManagerProfile from './pages/ManagerProfile';
import ManagerCalendar from './pages/ManagerCalendar';
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
    "ManagerClients": ManagerClients,
    "ManagerDashboard": ManagerDashboard,
    "ManagerFinancials": ManagerFinancials,
    "ManagerLogin": ManagerLogin,
    "ManagerLogistics": ManagerLogistics,
    "ManagerPurchases": ManagerPurchases,
    "ManagerSalesQuotes": ManagerSalesQuotes,
    "ManagerSupplierQuotes": ManagerSupplierQuotes,
    "ManagerProfile": ManagerProfile,
    "ManagerCalendar": ManagerCalendar,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};