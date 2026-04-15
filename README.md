# Aion2 Overlay

게임 중에 화면 위에 띄워서 사용할 수 있는 `WinForms + WebView2` 기반 오버레이 프로그램입니다.

## 기능

- `웹 / 아툴검색 / 침식 막넴 만두` 탭
- `항상 위`
- `클릭 통과`
- `투명도 조절`
- `창 크기 조절`
- `업데이트` 버튼과 GitHub 릴리즈 확인

## 실행 파일

개발 빌드 기본 경로:

```text
bin/Debug/net8.0-windows/Aion2Overlay.exe
```

배포용 ZIP은 `publish` 폴더를 압축해서 사용하면 됩니다.

## 개발 실행

```powershell
dotnet restore
dotnet build
dotnet run
```

## 일반 사용자 기준 필요 사항

- Windows 10/11
- `Microsoft Edge WebView2 Runtime`

`.NET SDK`는 개발할 때만 필요합니다.  
배포용으로 `self-contained publish`를 만들면 일반 사용자는 `.NET`을 따로 설치하지 않아도 됩니다.

## 업데이트 방식

앱 시작 후 GitHub 릴리즈를 확인해서, 현재 앱 버전보다 높은 릴리즈가 있으면 `업데이트` 버튼이 노란색으로 강조됩니다.

버전 예시:

- 현재 앱: `1.0.0`
- GitHub 릴리즈 태그: `v1.0.1`

이 경우 업데이트 버튼이 활성화됩니다.
