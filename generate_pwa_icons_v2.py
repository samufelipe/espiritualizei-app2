from PIL import Image, ImageOps
import os

def create_icon_max_fill(source_path, size, output_path):
    img = Image.open(source_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Encontrar a caixa delimitadora do conteúdo não transparente (o coração)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    # Queremos que o coração ocupe cerca de 85% do tamanho total para não ser cortado por ícones arredondados/quadrados do sistema
    target_content_size = int(size * 0.85)
    
    # Redimensionar mantendo a proporção
    ratio = min(target_content_size / img.width, target_content_size / img.height)
    new_size = (int(img.width * ratio), int(img.height * ratio))
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Criar a imagem final quadrada e transparente
    final_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    offset = ((size - img.width) // 2, (size - img.height) // 2)
    final_img.paste(img, offset, img)
    
    final_img.save(output_path, 'PNG', optimize=True)
    print(f"Ícone {size}x{size} (Preenchimento Máximo) gerado em: {output_path}")

source = '/home/ubuntu/upload/pasted_file_2dKTzW_image.png'
# Limpeza do fundo (mesma lógica anterior)
img = Image.open(source).convert('RGBA')
datas = img.getdata()
newData = []
for item in datas:
    if item[0] < 60 and item[1] < 60 and item[2] < 60:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)
img.putdata(newData)
temp_heart = 'temp_heart_clean_v2.png'
img.save(temp_heart)

public_dir = '/home/ubuntu/espiritualizei-app2-full/public'
create_icon_max_fill(temp_heart, 192, os.path.join(public_dir, 'icon-192.png'))
create_icon_max_fill(temp_heart, 512, os.path.join(public_dir, 'icon-512.png'))
create_icon_max_fill(temp_heart, 180, os.path.join(public_dir, 'apple-touch-icon.png'))
# Favicon um pouco maior para ser visível
create_icon_max_fill(temp_heart, 48, os.path.join(public_dir, 'favicon.png'))

os.remove(temp_heart)
