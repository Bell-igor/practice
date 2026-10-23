import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page">
      <div className="container container--narrow">
        <div className="card center" style={{ padding: 56 }}>
          <span className="feature__icon" style={{ margin: '0 auto', width: 52, height: 52 }}>
            <Compass size={24} />
          </span>
          <h1 style={{ marginTop: 20, fontSize: '2.4rem', letterSpacing: '-0.04em' }}>404</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Такой страницы нет — возможно, ссылка устарела.
          </p>
          <div className="row mt-24" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn--primary">
              <ArrowLeft size={16} /> На главную
            </Link>
            <Link to="/cases" className="btn btn--outline">
              В каталог кейсов
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
