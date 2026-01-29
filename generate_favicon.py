from PIL import Image, ImageDraw

def create_heart_icon(size):
    # Criar imagem transparente
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Cor lilás do Espiritualizei (#A78BFA)
    color = (167, 139, 250, 255)
    
    # Desenhar coração simplificado
    # Usando uma abordagem de círculos e polígono para um coração bonito
    margin = size // 10
    inner_size = size - 2 * margin
    
    # Coordenadas para o coração
    # Círculo esquerdo
    draw.ellipse([margin, margin, margin + inner_size // 2, margin + inner_size // 2], fill=color)
    # Círculo direito
    draw.ellipse([margin + inner_size // 2, margin, margin + inner_size, margin + inner_size // 2], fill=color)
    # Triângulo inferior
    draw.polygon([
        (margin, margin + inner_size // 4 + 2),
        (margin + inner_size, margin + inner_size // 4 + 2),
        (size // 2, margin + inner_size)
    ], fill=color)
    
    return img

# Gerar favicons em diferentes tamanhos
create_heart_icon(32).save('/home/ubuntu/espiritualizei-app2-full/public/favicon-32x32.png')
create_heart_icon(16).save('/home/ubuntu/espiritualizei-app2-full/public/favicon-16x16.png')
create_heart_icon(180).save('/home/ubuntu/espiritualizei-app2-full/public/apple-touch-icon.png')
# Para o .ico, salvamos o de 32px
create_heart_icon(32).save('/home/ubuntu/espiritualizei-app2-full/public/favicon.ico')

print("Favicons gerados com sucesso!")
