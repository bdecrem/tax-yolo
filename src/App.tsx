import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { W2Form } from './components/W2Form';
import { Form1099Page } from './components/Form1099Entry';
import { DeductionsForm } from './components/DeductionsForm';
import { RetirementForm } from './components/RetirementForm';
import { PaymentsForm } from './components/PaymentsForm';
import { ResultsView } from './components/ResultsView';
import { FormPreview } from './components/FormPreview';
import { Return2024 } from './components/Return2024';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="w2s" element={<W2Form />} />
          <Route path="1099s" element={<Form1099Page />} />
          <Route path="deductions" element={<DeductionsForm />} />
          <Route path="retirement" element={<RetirementForm />} />
          <Route path="payments" element={<PaymentsForm />} />
          <Route path="results" element={<ResultsView />} />
          <Route path="forms" element={<FormPreview />} />
          <Route path="return2024" element={<Return2024 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
