import Client from './pages/Client';
import ClientDashboard from './pages/ClientDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientLoginLanding from './pages/ClientLoginLanding';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import Home from './pages/Home';
import Manager from './pages/Manager';
import ManagerCalendar from './pages/ManagerCalendar';
import ManagerClients from './pages/ManagerClients';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerFinancials from './pages/ManagerFinancials';
import ManagerLogin from './pages/ManagerLogin';
import ManagerLoginLanding from './pages/ManagerLoginLanding';
import ManagerLogistics from './pages/ManagerLogistics';
import ManagerProfile from './pages/ManagerProfile';
import ManagerPurchases from './pages/ManagerPurchases';
import ManagerSalesQuotes from './pages/ManagerSalesQuotes';
import ManagerSupplierQuotes from './pages/ManagerSupplierQuotes';
import Supplier from './pages/Supplier';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierLogin from './pages/SupplierLogin';
import SupplierLoginLanding from './pages/SupplierLoginLanding';
import VehicleConnectorAdd from './pages/VehicleConnectorAdd';
import ClientVehicleAddForm from './pages/ClientVehicleAddForm';
import ClientOrganisationDetail from './pages/ClientOrganisationDetail';
import VehicleDetail from './pages/VehicleDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Client": Client,
    "ClientDashboard": ClientDashboard,
    "ClientLogin": ClientLogin,
    "ClientLoginLanding": ClientLoginLanding,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleDetail": ClientVehicleDetail,
    "Home": Home,
    "Manager": Manager,
    "ManagerCalendar": ManagerCalendar,
    "ManagerClients": ManagerClients,
    "ManagerDashboard": ManagerDashboard,
    "ManagerFinancials": ManagerFinancials,
    "ManagerLogin": ManagerLogin,
    "ManagerLoginLanding": ManagerLoginLanding,
    "ManagerLogistics": ManagerLogistics,
    "ManagerProfile": ManagerProfile,
    "ManagerPurchases": ManagerPurchases,
    "ManagerSalesQuotes": ManagerSalesQuotes,
    "ManagerSupplierQuotes": ManagerSupplierQuotes,
    "Supplier": Supplier,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
    "SupplierLoginLanding": SupplierLoginLanding,
    "VehicleConnectorAdd": VehicleConnectorAdd,
    "ClientVehicleAddForm": ClientVehicleAddForm,
    "ClientOrganisationDetail": ClientOrganisationDetail,
    "VehicleDetail": VehicleDetail,
}

export const pagesConfig = {
    mainPage: "ClientDashboard",
    Pages: PAGES,
    Layout: __Layout,
};