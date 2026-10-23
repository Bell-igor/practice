import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Companies from './pages/Companies'
import Company from './pages/Company'
import StudentProfile from './pages/StudentProfile'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import CaseEditor from './pages/CaseEditor'
import How from './pages/How'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<Company />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="case/new" element={<CaseEditor />} />
        <Route path="case/:id/edit" element={<CaseEditor />} />
        <Route path="how" element={<How />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
