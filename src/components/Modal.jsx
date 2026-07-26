export default function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <button className="close-quest" onClick={close}>×</button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}
