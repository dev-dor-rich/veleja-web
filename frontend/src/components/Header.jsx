// Cabeçalho institucional da aplicação Veleja
// Reservado pra links institucionais (Sobre nós, redes sociais) quando existirem.
// Não contém CTAs de conversão (isso fica dentro de cada página) nem o acesso
// administrativo (isso fica no Footer, disponível em todo o site).

function Header() {
  return (
    <header className="bg-[#041f43] px-4 py-3">
      <div className="flex items-center justify-end max-w-6xl mx-auto min-h-[24px]">
        {/* TODO: adicionar aqui "Sobre nós" e ícones de redes sociais
            quando as contas/páginas existirem */}
      </div>
    </header>
  );
}

export default Header;