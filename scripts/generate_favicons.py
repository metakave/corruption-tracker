import math
from PIL import Image, ImageDraw

def create_shield_favicon():
    # Supersampled resolution for crisp anti-aliasing
    SIZE = 1024
    scale = SIZE / 24.0
    
    # 1. Create base RGBA image with gradient
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    
    # Create mask for rounded rectangle (radius = 250px at 1024)
    mask = Image.new('L', (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (SIZE - 1, SIZE - 1)], radius=int(SIZE * 0.25), fill=255)
    
    # Generate diagonal gradient from Emerald-600 (#059669 -> 5, 150, 105) to Teal-500 (#14B8A6 -> 20, 184, 166)
    # Direction: bottom-left to top-right
    grad_img = Image.new('RGBA', (SIZE, SIZE))
    grad_pixels = grad_img.load()
    
    c_start = (5, 150, 105)
    c_end = (20, 184, 166)
    
    for y in range(SIZE):
        for x in range(SIZE):
            # t = 0 at bottom-left (x=0, y=SIZE), t = 1 at top-right (x=SIZE, y=0)
            t = (x + (SIZE - 1 - y)) / (2.0 * (SIZE - 1))
            t = max(0.0, min(1.0, t))
            r = int(c_start[0] + (c_end[0] - c_start[0]) * t)
            g = int(c_start[1] + (c_end[1] - c_start[1]) * t)
            b = int(c_start[2] + (c_end[2] - c_start[2]) * t)
            grad_pixels[x, y] = (r, g, b, 255)
            
    # Apply rounded mask to gradient
    img.paste(grad_img, (0, 0), mask)
    
    # Draw ShieldAlert icon on top
    draw = ImageDraw.Draw(img)
    
    # Shield icon geometry in 24x24 box
    # Center the 24x24 icon with scale factor
    # Shield path points approximating Lucide ShieldAlert:
    # Top center: (12, 2.28)
    # Top right wave: (12.76, 2.28) -> (17, 5) -> (19, 5) -> (20, 6)
    # Right side: (20, 13)
    # Bottom tip: (12, 22)
    # Left side: (4, 13)
    # Top left wave: (4, 6) -> (5, 5) -> (7, 5) -> (11.24, 2.28)
    
    # We can draw precise polygon/lines for the shield
    # Let's compute smooth points for the outer shield outline
    points = []
    
    # Top crest
    # Left curve from (12, 2.3) to (4, 6)
    def bezier_point(p0, p1, p2, p3, t):
        x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
        y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
        return (x, y)

    # Left top: from (12, 2.3) to (4, 6)
    for i in range(15):
        t = i / 14.0
        # M12 2.28 C10.5 3.8 8 5 5 5 A1 1 0 0 0 4 6
        pt = bezier_point((12, 2.28), (9.5, 4.0), (6.5, 5.0), (4, 6), t)
        points.append(pt)
        
    # Left side down to bottom
    # from (4, 6) to (4, 13)
    for i in range(1, 10):
        t = i / 10.0
        pt = (4, 6 + 7 * t)
        points.append(pt)
        
    # Left bottom curve: (4, 13) to (12, 21.95)
    for i in range(1, 20):
        t = i / 20.0
        # C4 18, 7.5 20.5, 11.66 21.95
        pt = bezier_point((4, 13), (4.5, 17.5), (7.5, 20.5), (12, 21.95), t)
        points.append(pt)
        
    # Right bottom curve: (12, 21.95) to (20, 13)
    for i in range(1, 20):
        t = i / 20.0
        pt = bezier_point((12, 21.95), (16.5, 20.5), (19.5, 17.5), (20, 13), t)
        points.append(pt)
        
    # Right side up: (20, 13) to (20, 6)
    for i in range(1, 10):
        t = i / 10.0
        pt = (20, 13 - 7 * t)
        points.append(pt)
        
    # Right top: (20, 6) to (12, 2.28)
    for i in range(1, 15):
        t = i / 14.0
        pt = bezier_point((20, 6), (17.5, 5.0), (14.5, 4.0), (12, 2.28), t)
        points.append(pt)
        
    # Scale points to target size with padding (margin = 17% on each side)
    icon_scale = SIZE * 0.65 / 24.0
    offset_x = SIZE * 0.175
    offset_y = SIZE * 0.175
    
    scaled_points = [(p[0] * icon_scale + offset_x, p[1] * icon_scale + offset_y) for p in points]
    
    stroke_width = int(icon_scale * 1.85)
    
    # Draw shield outline in white
    for i in range(len(scaled_points)):
        p1 = scaled_points[i]
        p2 = scaled_points[(i + 1) % len(scaled_points)]
        draw.line([p1, p2], fill=(255, 255, 255, 255), width=stroke_width)
        draw.ellipse([p1[0] - stroke_width/2, p1[1] - stroke_width/2, p1[0] + stroke_width/2, p1[1] + stroke_width/2], fill=(255, 255, 255, 255))
        
    # Exclamation bar: M12 8v4 -> from (12, 8) to (12, 12)
    bar_top = (12 * icon_scale + offset_x, 8.2 * icon_scale + offset_y)
    bar_bottom = (12 * icon_scale + offset_x, 12.5 * icon_scale + offset_y)
    draw.line([bar_top, bar_bottom], fill=(255, 255, 255, 255), width=stroke_width)
    draw.ellipse([bar_top[0] - stroke_width/2, bar_top[1] - stroke_width/2, bar_top[0] + stroke_width/2, bar_top[1] + stroke_width/2], fill=(255, 255, 255, 255))
    draw.ellipse([bar_bottom[0] - stroke_width/2, bar_bottom[1] - stroke_width/2, bar_bottom[0] + stroke_width/2, bar_bottom[1] + stroke_width/2], fill=(255, 255, 255, 255))
    
    # Exclamation dot: M12 16h.01 -> at (12, 16.2)
    dot_center = (12 * icon_scale + offset_x, 16.3 * icon_scale + offset_y)
    dot_radius = stroke_width * 0.6
    draw.ellipse([dot_center[0] - dot_radius, dot_center[1] - dot_radius, dot_center[0] + dot_radius, dot_center[1] + dot_radius], fill=(255, 255, 255, 255))
    
    # Resize and export to all standard favicon formats
    sizes = {
        'public/favicon-16x16.png': (16, 16),
        'public/favicon-32x32.png': (32, 32),
        'public/apple-touch-icon.png': (180, 180),
        'public/android-chrome-192x192.png': (192, 192),
        'public/android-chrome-512x512.png': (512, 512),
        'app/icon.png': (512, 512),
        'app/apple-icon.png': (180, 180)
    }
    
    for path, (w, h) in sizes.items():
        resized = img.resize((w, h), Image.Resampling.LANCZOS)
        resized.save(path, 'PNG')
        print(f"Generated: {path} ({w}x{h})")
        
    # Generate multi-resolution .ico (16, 32, 48, 64)
    ico_img = img.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated: public/favicon.ico (multi-res 16, 32, 48, 64)")

create_shield_favicon()
