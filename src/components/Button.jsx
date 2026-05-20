import "./Button.css";

function Button({ text, size = "medium", onClick, type = "button" }) {
  return (
    <button type={type} className={`button ${size}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
