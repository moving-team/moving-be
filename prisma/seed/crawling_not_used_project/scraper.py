import { Builder, By, WebDriver, WebElement } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome';
import * as chromedriver from 'chromedriver';
import { promises as fs } from 'fs';

interface Review {
  rating: string;
  review: string;
}

const scrapeData = async (): Promise<void> => {
  // ChromeDriver Service 설정 (ServiceBuilder 생성)
  const serviceBuilder = new ServiceBuilder(chromedriver.path);

  // WebDriver 초기화
  const driver: WebDriver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(serviceBuilder) // ServiceBuilder 전달
    .build();

  try {
    const url: string = 'https://soomgo.com/profile/users/1896012?prev=searchPro&hasFilter=false&serviceSelected=true&from=pro_list&serviceInfo=%7B%22id%22%3A670,%22name%22%3A%22%EA%B5%AD%EB%82%B4%20%EC%9D%B4%EC%82%AC%22,%22slug%22%3A%22%EA%B5%AD%EB%82%B4-%EC%9D%B4%EC%82%AC%22,%22cat1%22%3A%7B%22id%22%3A59,%22name%22%3A%22%EC%9D%B4%EC%82%AC%2F%EC%B2%AD%EC%86%8C%22%7D,%22cat2%22%3A%7B%22id%22%3A277,%22name%22%3A%22%EC%9D%B4%EC%82%AC%22%7D%7D'; // 목표 URL
    await driver.get(url);

    const maxClicks: number = 10;

    for (let i = 0; i < maxClicks; i++) {
      try {
        const moreButton: WebElement = await driver.findElement(By.css('button.btn.btn-none.more.collapse'));
        await moreButton.click();
        await driver.sleep(1000);
        console.log(`${i + 1}/${maxClicks}번째 버튼 클릭 완료`);
      } catch (error) {
        console.log('더 보기 버튼이 더 이상 없습니다.');
        break;
      }
    }

    const articles: WebElement[] = await driver.findElements(By.css('article.profile-review-item'));
    const data: Review[] = [];

    for (const article of articles) {
      try {
        const rating: string = await article.findElement(By.css('section.service-score p')).getText();
        const review: string = await article.findElement(By.css('p.review-text')).getText();
        data.push({ rating, review });
      } catch (error) {
        console.error('데이터를 추출할 수 없습니다:', error);
      }
    }

    const jsonData: string = JSON.stringify(data, null, 2);
    await fs.writeFile('reviews.json', jsonData, 'utf-8');
    console.log('데이터가 reviews.json 파일에 저장되었습니다.');
  } finally {
    await driver.quit();
  }
};

scrapeData().catch((error) => console.error('스크래핑 중 오류 발생:', error));
