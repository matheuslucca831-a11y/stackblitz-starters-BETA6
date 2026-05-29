// src/utils/print.ts

export function imprimirHtmlNoDesktop(conteudoHtml: string) {
  // 1. Cria um iframe temporário e o esconde da tela
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  
  if (doc) {
    // 2. Escreve o conteúdo HTML completo da guia dentro do iframe
    doc.open();
    doc.write(conteudoHtml);
    doc.close();

    // 3. Aguarda o carregamento dos estilos (Tailwind CDN) e dispara a impressão
    iframe.contentWindow?.focus();
    
    // Pequeno timeout para garantir que o Tailwind carregou as classes antes do print
    setTimeout(() => {
      iframe.contentWindow?.print();
      
      // Remove o iframe do DOM após fechar a janela de impressão
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}