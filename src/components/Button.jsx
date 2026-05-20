import "./Button.css";

function Button({ text, size = "medium" }) {
  return <button className={`button ${size}`}>{text}</button>;
}

export default Button;
