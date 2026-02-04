import os
from PIL import Image
import shutil

def optimize_backgrounds(source_dir, target_dir):
    """
    Otimiza imagens da pasta originais e salva em public/images/backgrounds/
    mantendo a estrutura de pastas.
    """
    target_size = (1080, 1350)  # Resolução ideal para social media
    
    # Contadores para relatório
    processed = 0
    skipped = 0
    errors = 0
    
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                # Caminho completo do arquivo original
                file_path = os.path.join(root, file)
                
                # Calcula o caminho relativo em relação ao source_dir
                rel_path = os.path.relpath(file_path, source_dir)
                
                # Define o caminho de saída (mesma estrutura, mas no target_dir)
                # Troca a extensão para .webp
                base_name = os.path.splitext(rel_path)[0]
                output_rel_path = base_name + ".webp"
                output_path = os.path.join(target_dir, output_rel_path)
                
                # Cria o diretório de saída se não existir
                output_dir = os.path.dirname(output_path)
                os.makedirs(output_dir, exist_ok=True)
                
                # Verifica se o arquivo já existe e é mais recente
                if os.path.exists(output_path):
                    src_mtime = os.path.getmtime(file_path)
                    dst_mtime = os.path.getmtime(output_path)
                    if dst_mtime >= src_mtime:
                        print(f"[OK] Já otimizado (ignorado): {rel_path}")
                        skipped += 1
                        continue
                
                try:
                    with Image.open(file_path) as img:
                        # Converte para RGB se necessário (para imagens com transparência ou modo P)
                        if img.mode in ('RGBA', 'LA', 'P'):
                            # Preserva transparência se for PNG com alpha
                            if img.mode == 'RGBA' and file.lower().endswith('.png'):
                                # Mantém RGBA para preservar transparência
                                pass
                            else:
                                img = img.convert('RGB')
                        elif img.mode != 'RGB':
                            img = img.convert('RGB')
                        
                        # Redimensiona mantendo o aspecto (thumbnail é mais eficiente)
                        img_copy = img.copy()
                        img_copy.thumbnail(target_size, Image.Resampling.LANCZOS)
                        
                        # Salva em WebP com qualidade otimizada
                        if img_copy.mode == 'RGBA':
                            img_copy.save(output_path, "WEBP", quality=85, method=6)
                        else:
                            img_copy.save(output_path, "WEBP", quality=85, method=6)
                        
                        # Calcula economia de espaço
                        original_size = os.path.getsize(file_path)
                        new_size = os.path.getsize(output_path)
                        reduction = (1 - new_size / original_size) * 100
                        
                        print(f"[OK] Otimizado: {rel_path} ({reduction:.1f}% menor)")
                        processed += 1
                        
                except Exception as e:
                    print(f"[ERRO] Falha ao processar {rel_path}: {e}")
                    errors += 1
    
    print("\n" + "="*60)
    print("RESUMO DA OTIMIZAÇÃO")
    print("="*60)
    print(f"Imagens processadas: {processed}")
    print(f"Imagens ignoradas (já otimizadas): {skipped}")
    print(f"Erros: {errors}")
    print("="*60)

if __name__ == "__main__":
    # Diretório de origem (imagens grandes)
    source_path = r"public\images\backgrounds\originais"
    
    # Diretório de destino (imagens otimizadas)
    target_path = r"public\images\backgrounds"
    
    print(f"Origem: {source_path}")
    print(f"Destino: {target_path}")
    print("="*60)
    
    optimize_backgrounds(source_path, target_path)
