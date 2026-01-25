import ClientDashboard from './pages/ClientDashboard';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import Home from './pages/Home';
import ManagerCalendar from './pages/ManagerCalendar';
import ManagerClients from './pages/ManagerClients';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerFinancials from './pages/ManagerFinancials';
import ManagerLogistics from './pages/ManagerLogistics';
import ManagerProfile from './pages/ManagerProfile';
import ManagerPurchases from './pages/ManagerPurchases';
import ManagerSalesQuotes from './pages/ManagerSalesQuotes';
import ManagerSupplierQuotes from './pages/ManagerSupplierQuotes';
import SupplierDashboard from './pages/SupplierDashboard';
import Client from './pages/Client';
import Manager from './pages/Manager';
import Supplier from './pages/Supplier';
import ClientLogin from './pages/ClientLogin';
import ManagerLogin from './pages/ManagerLogin';
import SupplierLogin from './pages/SupplierLogin';
import ClientLoginLanding from './pages/ClientLoginLanding';
import ManagerLoginLanding from './pages/ManagerLoginLanding';
import SupplierLoginLanding from './pages/SupplierLoginLanding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ClientDashboard": ClientDashboard,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleDetail": ClientVehicleDetail,
    "Home": Home,
    "ManagerCalendar": ManagerCalendar,
    "ManagerClients": ManagerClients,
    "ManagerDashboard": ManagerDashboard,
    "ManagerFinancials": ManagerFinancials,
    "ManagerLogistics": ManagerLogistics,
    "ManagerProfile": ManagerProfile,
    "ManagerPurchases": ManagerPurchases,
    "ManagerSalesQuotes": ManagerSalesQuotes,
    "ManagerSupplierQuotes": ManagerSupplierQuotes,
    "SupplierDashboard": SupplierDashboard,
    "Client": Client,
    "Manager": Manager,
    "Supplier": Supplier,
    "ClientLogin": ClientLogin,
    "ManagerLogin": ManagerLogin,
    "SupplierLogin": SupplierLogin,
    "ClientLoginLanding": ClientLoginLanding,
    "ManagerLoginLanding": ManagerLoginLanding,
    "SupplierLoginLanding": SupplierLoginLanding,
}

export const pagesConfig = {
    mainPage: "ClientDashboard",
    Pages: PAGES,
    Layout: __Layout,
};