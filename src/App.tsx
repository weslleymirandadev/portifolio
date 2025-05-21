import { Provider } from "react-redux";
import { store } from "./app/store";
import { AppContent } from "./components/layout/AppContent";

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
