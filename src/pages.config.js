import ClientLogin from './pages/ClientLogin';
import SupplierLogin from './pages/SupplierLogin';
import ManagerLogin from './pages/ManagerLogin';


export const PAGES = {
    "ClientLogin": ClientLogin,
    "SupplierLogin": SupplierLogin,
    "ManagerLogin": ManagerLogin,
}

export const pagesConfig = {
    mainPage: "ClientLogin",
    Pages: PAGES,
};