import { Routes, Route } from "react-router-dom";
import UomIndex from "./Pages/UOM/UomIndex";
import { fr } from "zod/v4/locales";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CategoryIndex from "./Pages/Category/CategoryIndex";
import AccountsIndex from "./Pages/Accounts/AccountsIndex";
import LocationIndex from "./Pages/Location/LocationIndex";
import UnitIndex from "./Pages/Units/UnitIndex";
import ItemType from "./Pages/ItemType/ItemType";
import ItemSubTypeIndex from "./Pages/ItemSubType/ItemSubTypeIndex";
import SettingsIndex from "./Pages/Settings/SettingsIndex";
import ItemsIndex from "./Pages/Inventory/ItemsIndex";
import AddItem from "./Pages/Inventory/AddItem";
import EditItem from "./Pages/Inventory/EditItem";
import UntrackItemIndex from "./Pages/UnTrackItem/UntrackItemIndex";
import AddUntrackItem from "./Pages/UnTrackItem/AddUntrackItem";
import ItemTracking from "./Pages/Inventory/ItemTracking";
import UserIndex from "./Pages/Users/UserIndex";
import UserPermissions from "./Pages/Users/UserPermissions";
import AddNewUser from "./Pages/Users/AddNewUser";
import EditUser from "./Pages/Users/EditUser";
import AssetIndex from "./Pages/Assets/AssetIndex";
import AddAsset from "./Pages/Assets/AddAsset";
import EditAsset from "./Pages/Assets/EditAsset";
import VehicleIndex from "./Pages/Vehicle/VehicleIndex";
import AddVehicle from "./Pages/Vehicle/AddVehicle";
import EditVehicle from "./Pages/Vehicle/EditVehicle";
import ManufacturersIndex from "./Pages/Manufacturer/ManufacturersIndex";
import AddManufacturer from "./Pages/Manufacturer/AddManufacturers";
import EditManufacturer from "./Pages/Manufacturer/EditManufacturer";
import ConditionIndex from "./Pages/Conditions/ConditionIndex";
import VendorIndex from "./Pages/Vendor/VendorIndex";
import AddVendor from "./Pages/Vendor/AddVendor";
import EditVendor from "./Pages/Vendor/EditVendor";
import SiteDemandIndex from "./Pages/SiteDemand/SiteDemandIndex";
import AddSiteDemand from "./Pages/SiteDemand/AddSiteDemand";
import EditSiteDemand from "./Pages/SiteDemand/EditSiteDemand";
import ViewSiteDemand from "./Pages/SiteDemand/ViewSiteDemand";
import MarketPurchaseIndex from "./Pages/MarketPurchase/MarketPurchaseIndex";
import AddMarketPurchase from "./Pages/MarketPurchase/AddMarketPurchase";
import EditMarketPurchase from "./Pages/MarketPurchase/EditMarketPurchase";
import WhtIndex from "./Pages/Wht/WhtIndex";
import AddWht from "./Pages/Wht/AddWht";
import EditWht from "./Pages/Wht/EditWht";
import TaxPayerTypeIndex from "./Pages/TaxPayerType/TaxPayerTypeIndex";
import AddTaxPayerType from "./Pages/TaxPayerType/AddTaxPayerType";
import EditTaxPayerType from "./Pages/TaxPayerType/EditTaxPayerType";
import EditUntrackItem from "./Pages/UnTrackItem/EditUntrackItem";
import CategoryMenu from "./Pages/Inventory/CategoryMenu";
import BankIndex from "./Pages/Banks/BankIndex";
import PurchaseOrderIndex from "./Pages/PurchaseOrder/PurchaseOrderIndex";
import AddPurchaseOrder from "./Pages/PurchaseOrder/AddPurchaseOrder";
import EditPurchaseOrder from "./Pages/PurchaseOrder/EditPurchaseOrder";
import ViewPurchaseOrder from "./Pages/PurchaseOrder/ViewPurchaseOrder";
import SitePurchaseAdd from "./Pages/SitePurchase/SitePurchaseAdd";
import SitePurchaseIndex from "./Pages/SitePurchase/SitePurcaseIndex";
import ViewMarketPurchase from "./Pages/MarketPurchase/ViewMarketPurchase";
import PermissionsIndex from "./Pages/Permissions/PermissionsIndex";
import EmployeeIndex from "./Pages/Employees/EmployeeIndex";
import TrackDemand from "./Pages/SiteDemand/TrackDemand";
import ViewUntrackItem from "./Pages/UnTrackItem/ViewUntrackItem";
import MarketPurchaseView from "./Pages/MarketPurchase/MarketPurchaseView";
import InterTransferIndex from "./Pages/InterStoreTransfer/InterTransferIndex";
import ShowPurchaseOrder from "./Pages/PurchaseOrder/ShowPurchaseOrder";
import WaitingForTransit from "./components/Pages/WaitingForTransit";
import useIdleLogout from "./useIdleLogout";
import CreateShipment from "./components/Comments/CreateShipment";
import ShipmentsList from "./components/Comments/ShipmentsList";
import CreateAsset from "./components/Pages/AssetManagement/CreateAsset";
import VBRList from "./components/Pages/VBR/VBRList";
import VBRDetails from "./components/Pages/VBR/VBRDetails";
import VBRForm from "./components/Pages/VBR/VBRForm";
import GateIn from "./components/Pages/VBR/VBRManagement";
import VBRLoadingProcess from "./components/Pages/VBR/VBRLoadingProcess";
import { DispatchApproval } from "./components/Pages/VBR/DispatchApproval";
import GateOutward from "./components/Pages/GateProcessManagement/GateOutward";
import GateOutRequest from "./components/Pages/GateProcessManagement/GateOutRequest";
import NoVBRGateIn from "./components/Pages/GateProcessManagement/NoVBRGateIn";

function App() {
  useIdleLogout();

  useEffect(() => {
    // Set the zoom level to 75% on component mount
  }, []);
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="waiting-for-transit" element={<WaitingForTransit />} />
            <Route path="create-shipment" element={<CreateShipment />} />
            <Route path="shipments" element={<ShipmentsList />} />
            <Route path="assets-management" element={<CreateAsset />} />
            <Route path="vbr" element={<VBRList />} />
            <Route path="vbr-details/:id" element={<VBRDetails />} />
            <Route path="vbr/create" element={<VBRForm />} />
            <Route path="vbr/edit/:id" element={<VBRForm />} />
            <Route path="vbr-management/gate-in" element={<GateIn />} />
            <Route
              path="vbr-management/loading"
              element={<VBRLoadingProcess />}
            />
            <Route
              path="vbr-management/dispatch"
              element={<DispatchApproval />}
            />
            <Route path="gate-pass" element={<GateOutward />} />
            <Route path="gate-out" element={<GateOutRequest />} />
            <Route path="no-gate-in" element={<NoVBRGateIn />} />
            <Route path="category" element={<CategoryIndex />} />
            <Route path="accounts" element={<AccountsIndex />} />
            <Route path="location" element={<LocationIndex />} />
            <Route path="unit-measurement" element={<UnitIndex />} />
            <Route path="item-type" element={<ItemType />} />
            <Route path="item-sub-type" element={<ItemSubTypeIndex />} />
            <Route path="app-settings" element={<SettingsIndex />} />
            <Route path="inventory" element={<ItemsIndex />} />
            <Route path="inventory/add" element={<AddItem />} />
            <Route path="inventory/edit/:id" element={<EditItem />} />
            <Route path="untracked-items" element={<UntrackItemIndex />} />
            <Route path="untrack-items/add" element={<AddUntrackItem />} />
            <Route
              path="untrack-items/edit/:id"
              element={<EditUntrackItem />}
            />
            <Route path="item-tracking/track/:id" element={<ItemTracking />} />
            <Route path="users" element={<UserIndex />} />
            <Route path="users/add" element={<AddNewUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="user-permissions/:id" element={<UserPermissions />} />
            <Route path="assets" element={<AssetIndex />} />
            <Route path="assets/add" element={<AddAsset />} />
            <Route path="assets/edit/:id" element={<EditAsset />} />
            <Route path="vehicles" element={<VehicleIndex />} />
            <Route path="vehicles/add" element={<AddVehicle />} />
            <Route path="vehicles/edit/:id" element={<EditVehicle />} />
            <Route path="Manufacturers" element={<ManufacturersIndex />} />
            <Route path="Manufacturers/add" element={<AddManufacturer />} />
            <Route
              path="Manufacturers/edit/:id"
              element={<EditManufacturer />}
            />
            <Route path="conditions" element={<ConditionIndex />} />
            <Route path="vendors" element={<VendorIndex />} />
            <Route path="vendors/add" element={<AddVendor />} />
            <Route path="vendors/edit/:id" element={<EditVendor />} />
            <Route path="site-demands" element={<SiteDemandIndex />} />
            <Route path="site-demands/add" element={<AddSiteDemand />} />
            <Route path="site-demands/edit/:id" element={<EditSiteDemand />} />
            <Route path="site-demands/show/:id" element={<ViewSiteDemand />} />
            <Route path="market-purchases" element={<MarketPurchaseIndex />} />
            <Route
              path="market-purchases/create"
              element={<AddMarketPurchase />}
            />
            <Route
              path="market-purchases/:id/edit"
              element={<EditMarketPurchase />}
            />
            <Route
              path="market-purchases/:id/view"
              element={<ViewMarketPurchase />}
            />
            <Route path="whts" element={<WhtIndex />} />
            <Route path="wht/add" element={<AddWht />} />
            <Route path="wht/edit/:id" element={<EditWht />} />
            {/* Tax Payer Type routes */}
            <Route path="tax-payer-types" element={<TaxPayerTypeIndex />} />
            <Route path="tax-payer-types/add" element={<AddTaxPayerType />} />
            <Route
              path="tax-payer-types/edit/:id"
              element={<EditTaxPayerType />}
            />
            <Route path="categorymenu" element={<CategoryMenu />} />
            <Route path="banks" element={<BankIndex />} />
            <Route path="purchase-orders" element={<PurchaseOrderIndex />} />
            <Route path="purchase-orders/add" element={<AddPurchaseOrder />} />
            <Route
              path="purchase-orders/:id/edit"
              element={<EditPurchaseOrder />}
            />
            <Route path="purchase-orders/:id" element={<ViewPurchaseOrder />} />
            <Route path="site-purchases" element={<SitePurchaseIndex />} />
            <Route path="site-purchase/create" element={<SitePurchaseAdd />} />
            <Route path="uoms" element={<UomIndex />} />
            <Route
              path="market-purchase/show/:id"
              element={<ViewMarketPurchase />}
            />
            <Route path="permissions" element={<PermissionsIndex />} />
            <Route path="employees" element={<EmployeeIndex />} />
            <Route path="site-demands/track/:id" element={<TrackDemand />} />
            <Route
              path="untrack-items/show/:id"
              element={<ViewUntrackItem />}
            />
            <Route path="inter-transfer" element={<InterTransferIndex />} />
            <Route
              path="purchase-order/show/:id"
              element={<ShowPurchaseOrder />}
            />
            <Route path="" element={<Dashboard />} />
          </Route>

          <Route path="/" element={<Login />} />
        </Routes>

        {/* Toast container outside of Routes */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </>
  );
}

export default App;
