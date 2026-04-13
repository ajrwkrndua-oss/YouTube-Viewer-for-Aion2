# 유튜브 오버레이 for AION2

게임 위에 띄워서 사용할 수 있는 Electron 기반 오버레이 프로그램입니다.

## 기능

- 유튜브 로그인 및 재생
- 항상 위 고정
- 투명도 조절
- 클릭 통과
- 뒤로 / 앞으로 이동
- 아툴 사이트 탭
- 침식 막넴 만두 안내 이미지 탭

## 실행

```powershell
cd "C:\Users\ajrwk\OneDrive\바탕 화면\새 폴더\YouTubeOverlayElectron"
$env:Path = "C:\Program Files\nodejs;" + $env:Path
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" start
```

## 배포 파일

릴리즈용 압쬕 파일은 `dist` 폴더에 생성됩니다.
