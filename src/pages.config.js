import ClientLogin from './pages/ClientLogin';
import SupplierLogin from './pages/SupplierLogin';
import ManagerLogin from './pages/ManagerLogin';
import ClientDashboard from './pages/ClientDashboard';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import SupplierDashboard from './pages/SupplierDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerClients from './pages/ManagerClients';
import ManagerSalesQuotes from './pages/ManagerSalesQuotes';
import ManagerSupplierQuotes from './pages/ManagerSupplierQuotes';
import ManagerLogistics from './pages/ManagerLogistics';
import ManagerPurchases from './pages/ManagerPurchases';
import ManagerFinancials from './pages/ManagerFinancials';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ClientLogin": ClientLogin,
    "SupplierLogin": SupplierLogin,
    "ManagerLogin": ManagerLogin,
    "ClientDashboard": ClientDashboard,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleDetail": ClientVehicleDetail,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
    "SupplierDashboard": SupplierDashboard,
    "ManagerDashboard": ManagerDashboard,
    "ManagerClients": ManagerClients,
    "ManagerSalesQuotes": ManagerSalesQuotes,
    "ManagerSupplierQuotes": ManagerSupplierQuotes,
    "ManagerLogistics": ManagerLogistics,
    "ManagerPurchases": ManagerPurchases,
    "ManagerFinancials": ManagerFinancials,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};