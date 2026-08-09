// Botão reutilizável da aplicação Veleja
// Centraliza os estilos visuais pra manter consistência entre as páginas

function Button({
  children,
  onClick,
  tipo = 'primary',
  tamanho = 'medium',
  disabled = false,
  type = 'button', // atributo HTML nativo: 'button', 'submit' ou 'reset'
}) {
  // Estilos visuais por variante
  const estilosPorTipo = {
    primary: 'bg-[#00D9E9] text-white hover:bg-[#2FA89F]',
    secondary: 'border-2 border-[#00D9E9] text-[#00D9E9] hover:bg-[#00D9E9] hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  // Estilos por tamanho
  const estilosPorTamanho = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-semibold transition-colors duration-200
        ${estilosPorTipo[tipo]}
        ${estilosPorTamanho[tamanho]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

export default Button;