// 홈 화면의 소개 영상 설정. 아래 둘 중 하나만 채우면 영상이 나옵니다.
//  1) src: 프로젝트 public/videos/ 폴더에 넣은 파일 경로  (예: '/videos/intro.mp4')
//  2) youtube: 유튜브 영상 주소 끝의 ID  (예: https://youtu.be/abc123XYZ → 'abc123XYZ', 일부공개로 올려도 됩니다)
// poster 는 재생 전에 보일 이미지(선택)입니다. 비워 두면 별이 반짝이는 하늘이 나옵니다.
// 파일이 크면(수십 MB 이상) 저장소가 무거워지니 유튜브를 권장합니다.
export const INTRO_VIDEO = {
  title: '제주도 신들에 대한 영상',
  src: '/videos/intro.mp4',
  youtube: '',
  poster: '/videos/intro-poster.jpg',
}
