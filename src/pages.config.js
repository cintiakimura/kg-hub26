import ClientLogin from './pages/ClientLogin';
import SupplierLogin from './pages/SupplierLogin';
import ManagerLogin from './pages/ManagerLogin';
import ClientDashboard from './pages/ClientDashboard';
import ClientVehicleAdd from './pages/ClientVehicleAdd';
import ClientVehicleDetail from './pages/ClientVehicleDetail';
import ClientQuotes from './pages/ClientQuotes';
import ClientShipments from './pages/ClientShipments';


export const PAGES = {
    "ClientLogin": ClientLogin,
    "SupplierLogin": SupplierLogin,
    "ManagerLogin": ManagerLogin,
    "ClientDashboard": ClientDashboard,
    "ClientVehicleAdd": ClientVehicleAdd,
    "ClientVehicleDetail": ClientVehicleDetail,
    "ClientQuotes": ClientQuotes,
    "ClientShipments": ClientShipments,
}

export const pagesConfig = {
    mainPage: "ClientLogin",
    Pages: PAGES,
};