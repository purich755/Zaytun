# Достаёт вектор вордмарка из макета вывески (brand/zaytun-sign-mockup.pdf).
import fitz,sys,json
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
d=fitz.open('brand/zaytun-sign-mockup.pdf'); p=d[0]
dr=p.get_drawings()
def path(drw,ox,oy,s=10):
    out=[];last=None
    def f(pt): return f"{(pt.x-ox)*s:.2f} {(pt.y-oy)*s:.2f}"
    for it in drw['items']:
        k=it[0]
        if k=='l':
            a,b=it[1],it[2]
            if last is None or abs(a.x-last.x)+abs(a.y-last.y)>1e-3:
                if out: out.append('Z')
                out.append('M'+f(a))
            out.append('L'+f(b)); last=b
        elif k=='c':
            a,b,c,e=it[1],it[2],it[3],it[4]
            if last is None or abs(a.x-last.x)+abs(a.y-last.y)>1e-3:
                if out: out.append('Z')
                out.append('M'+f(a))
            out.append('C'+f(b)+' '+f(c)+' '+f(e)); last=e
        elif k=='re':
            r=it[1]
            if out: out.append('Z')
            out.append('M'+f(r.tl)+'L'+f(r.tr)+'L'+f(r.br)+'L'+f(r.bl)); last=None
        elif k=='qu':
            q=it[1]
            if out: out.append('Z')
            out.append('M'+f(q.ul)+'L'+f(q.ur)+'L'+f(q.lr)+'L'+f(q.ll)); last=None
    out.append('Z')
    return ''.join(out)
def side(idx,name):
    x0=min(dr[i]['rect'].x0 for i in idx); y0=min(dr[i]['rect'].y0 for i in idx)
    x1=max(dr[i]['rect'].x1 for i in idx); y1=max(dr[i]['rect'].y1 for i in idx)
    ps=[path(dr[i],x0,y0) for i in idx]
    w,h=(x1-x0)*10,(y1-y0)*10
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" fill="currentColor">'+''.join(f'<path id="{name}-{n}" fill-rule="nonzero" d="{q}"/>' for n,q in zip(idx,ps))+'</svg>'
    open(f'brand/{name}.svg','w',encoding='utf-8').write(svg)
    print(name,w,h,len(svg))
    for i in idx: print(i,[round(v-(x0 if j%2==0 else y0),1) for j,v in enumerate(dr[i]['rect'])], dr[i].get('even_odd'))
side([16,11,14,15,12,13,10,17],'wordmark-ru')
side([3,5,7,8,6,4,9],'wordmark-en')
# Диск вывески: реальный градиент + маска
for im,ma,n in [(16,17,'a'),(20,21,'b')]:
    pm=fitz.Pixmap(d,im); pm=fitz.Pixmap(fitz.csRGB,pm)
    m=fitz.Pixmap(d,ma)
    out=fitz.Pixmap(pm,m)
    out.save(f'brand/sign-texture-{n}.png')
# Круглый знак целиком, сторона А и Б — растр 2x (клип по кругу кольца)
ring=[dr[1]['rect'],dr[2]['rect']]
print(ring)
for r,n in zip(ring,'ab'):
    clip=fitz.Rect(r.x0-8,r.y0-8,r.x1+8,r.y1+8)
    px=p.get_pixmap(dpi=300,clip=clip,alpha=True); px.save(f'brand/sign-side-{n}.png'); print(px.width,px.height)
