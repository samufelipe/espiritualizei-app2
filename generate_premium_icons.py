from PIL import Image, ImageDraw
import os

def create_premium_icon(source_path, size, output_path, bg_color='#1A2530'):
    # Abrir o coração limpo
    heart = Image.open(source_path)
    if heart.mode != 'RGBA':
        heart = heart.convert('RGBA')
    
    # Encontrar a caixa delimitadora do coração para centralizar perfeitamente
    bbox = heart.getbbox()
    if bbox:
        heart = heart.crop(bbox)
    
    # Definir o tamanho do coração dentro do ícone (70% para um visual equilibrado e premium)
    target_heart_size = int(size * 0.7)
    ratio = min(target_heart_size / heart.width, target_heart_size / heart.height)
    new_size = (int(heart.width * ratio), int(heart.height * ratio))
    heart = heart.resize(new_size, Image.Resampling.LANCZOS)
    
    # Criar o fundo com a cor oficial
    final_img = Image.new('RGBA', (size, size), bg_color)
    
    # Centralizar o coração sobre o fundo oficial
    offset = ((size - heart.width) // 2, (size - heart.height) // 2)
    final_img.paste(heart, offset, heart)
    
    # Salvar como PNG de alta qualidade
    final_img.save(output_path, 'PNG', optimize=True)
    print(f"Ícone Premium {size}x{size} gerado em: {output_path}")

source = '/home/ubuntu/upload/pasted_file_2dKTzW_image.png'
# Limpeza do fundo da imagem original para extrair o coração
img = Image.open(source).convert('RGBA')
datas = img.getdata()
newData = []
for item in datas:
    if item[0] < 60 and item[1] < 60 and item[2] < 60:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)
img.putdata(newData)
temp_heart = 'temp_heart_clean_premium.png'
img.save(temp_heart)

public_dir = '/home/ubuntu/espiritualizei-app2-full/public'
# Gerar os ícones com o fundo oficial #1A2530
create_premium_icon(temp_heart, 192, os.path.join(public_dir, 'icon-192.png'))
create_premium_icon(temp_heart, 512, os.path.join(public_dir, 'icon-512.png'))
create_premium_icon(temp_heart, 180, os.path.join(public_dir, 'apple-touch-icon.png'))

# Para o favicon, mantemos a transparência pois navegadores lidam bem com isso e fica mais elegante na aba
def create_transparent_favicon(source_path, size, output_path):
    img = Image.open(source_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.thumbnail((size, size), Image.Resampling.LANCZOS)
    final_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    offset = ((size - img.width) // 2, (size - img.height) // 2)
    final_img.paste(img, offset, img)
    final_img.save(output_path, 'PNG')

create_transparent_favicon(temp_heart, 48, os.path.join(public_dir, 'favicon.png'))

os.remove(temp_heart)
