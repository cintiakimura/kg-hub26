import Client from './pages/Client';
import ClientDashboard from './pages/ClientDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientLoginLanding from './pages/ClientLoginLanding';
import ClientOrganisationDetail from './pages/ClientOrganisationDetail';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleAddForm from './pages/ClientVehicleAddForm';
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
import ProductionControl from './pages/ProductionControl';
import Supplier from './pages/Supplier';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierLogin from './pages/SupplierLogin';
import SupplierLoginLanding from './pages/SupplierLoginLanding';
import VehicleConnectorAdd from './pages/VehicleConnectorAdd';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import AddConnector from './pages/AddConnector';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Client": Client,
    "ClientDashboard": ClientDashboard,
    "ClientLogin": ClientLogin,
    "ClientLoginLanding": ClientLoginLanding,
    "ClientOrganisationDetail": ClientOrganisationDetail,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleAddForm": ClientVehicleAddForm,
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
    "ProductionControl": ProductionControl,
    "Supplier": Supplier,
    "SupplierDashboard": SupplierDashboard,
    "SupplierLogin": SupplierLogin,
    "SupplierLoginLanding": SupplierLoginLanding,
    "VehicleConnectorAdd": VehicleConnectorAdd,
    "VehicleDetail": VehicleDetail,
    "AddVehicle": AddVehicle,
    "AddConnector": AddConnector,
}

export const pagesConfig = {
    mainPage: "ClientDashboard",
    Pages: PAGES,
    Layout: __Layout,
};