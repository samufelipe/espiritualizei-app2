from PIL import Image, ImageOps
import os

def create_icon(source_path, size, output_path):
    img = Image.open(source_path)
    # Garantir que a imagem tenha canal alfa
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Redimensionar mantendo a proporção e com alta qualidade
    img.thumbnail((size, size), Image.Resampling.LANCZOS)
    
    # Criar uma nova imagem quadrada transparente
    new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Centralizar o coração
    offset = ((size - img.width) // 2, (size - img.height) // 2)
    new_img.paste(img, offset, img)
    
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"Ícone {size}x{size} gerado em: {output_path}")

source = '/home/ubuntu/upload/pasted_file_2dKTzW_image.png' # Imagem original enviada pelo usuário
# Primeiro, remover o fundo escuro da imagem original para ter o coração limpo
img = Image.open(source).convert('RGBA')
datas = img.getdata()

newData = []
for item in datas:
    # Detectar o fundo escuro (ajustar conforme necessário)
    if item[0] < 60 and item[1] < 60 and item[2] < 60:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

img.putdata(newData)
temp_heart = 'temp_heart_clean.png'
img.save(temp_heart)

# Gerar os tamanhos necessários para PWA
public_dir = '/home/ubuntu/espiritualizei-app2-full/public'
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

create_icon(temp_heart, 192, os.path.join(public_dir, 'icon-192.png'))
create_icon(temp_heart, 512, os.path.join(public_dir, 'icon-512.png'))
create_icon(temp_heart, 180, os.path.join(public_dir, 'apple-touch-icon.png'))
create_icon(temp_heart, 32, os.path.join(public_dir, 'favicon.png'))

os.remove(temp_heart)
