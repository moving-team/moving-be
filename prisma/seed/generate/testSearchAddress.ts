import axios from 'axios';

// 카카오 API 응답 타입 정의
interface AddressDocument {
  address_name: string; // 전체 주소
  x: string;            // 경도 (longitude)
  y: string;            // 위도 (latitude)
}

interface AddressResponse {
  documents: AddressDocument[]; // 주소 목록
}

// 카카오 API 키
const KAKAO_API_KEY = 'a9a62b2e64ab8fb950e8a2482ebdff88';

// 키워드 배열 (무작위 검색용)
const keywords = [
  '강원도 평창군 평창강로1098 (평창읍)',
];

// 무작위 키워드 생성 함수
function getRandomKeyword(): string {
  const randomIndex = Math.floor(Math.random() * keywords.length);
  return keywords[randomIndex];
}

// 카카오 주소 검색 API 호출
async function searchAddress() {
  const keyword = getRandomKeyword(); // 무작위 키워드
  console.log(`검색 키워드: ${keyword}`);

  try {
    // axios 요청의 응답 타입을 AddressResponse로 설정
    const response = await axios.get<AddressResponse>(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`, // REST API 키
        },
        params: {
          query: keyword, // 검색 키워드
          size: 5, // 검색 결과 개수 제한
        },
      }
    );

    // 결과 출력
    const documents = response.data.documents;
    if (documents.length > 0) {
      console.log('검색 결과:');
      documents.forEach((doc: AddressDocument, index: number) => {
        console.log(`${index + 1}. ${doc.address_name}`);
      });
    } else {
      console.log('검색 결과가 없습니다.');
    }
  } catch (error: any) {
    console.error('API 호출 중 에러:', error.response?.data || error.message);
  }
}

// 실행
searchAddress();
