from PIL import Image, ImageOps

def remove_background(input_path, output_path):
    # Abrir a imagem
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # A cor do fundo é aproximadamente #1A2530 (26, 37, 48)
    # Vamos considerar qualquer pixel escuro como fundo
    for item in datas:
        # Se o pixel for predominantemente escuro (fundo)
        if item[0] < 60 and item[1] < 60 and item[2] < 80:
            new_data.append((0, 0, 0, 0)) # Transparente
        else:
            # Manter o pixel (coração lilás)
            new_data.append(item)

    img.putdata(new_data)
    
    # Cortar as bordas transparentes para centralizar o coração
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    # Redimensionar para tamanhos padrão mantendo a proporção
    def save_resized(size, path):
        # Criar um canvas quadrado transparente
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        # Redimensionar o coração para caber no canvas com uma pequena margem
        margin = size // 10
        max_size = size - 2 * margin
        
        ratio = min(max_size / img.width, max_size / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        resized_heart = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Colar no centro
        offset = ((size - new_size[0]) // 2, (size - new_size[1]) // 2)
        canvas.paste(resized_heart, offset, resized_heart)
        canvas.save(path)

    save_resized(32, '/home/ubuntu/espiritualizei-app2-full/public/favicon-32x32.png')
    save_resized(16, '/home/ubuntu/espiritualizei-app2-full/public/favicon-16x16.png')
    save_resized(180, '/home/ubuntu/espiritualizei-app2-full/public/apple-touch-icon.png')
    save_resized(32, '/home/ubuntu/espiritualizei-app2-full/public/favicon.ico')
    save_resized(512, '/home/ubuntu/espiritualizei-app2-full/public/icon-512.png')
    save_resized(192, '/home/ubuntu/espiritualizei-app2-full/public/icon-192.png')

remove_background('/home/ubuntu/upload/pasted_file_2dKTzW_image.png', 'heart_clean.png')
print("Assets do coração original gerados com sucesso!")
