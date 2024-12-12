import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const middlewareSequence: string[] = []; // 실행된 미들웨어 이름 저장

  console.log(`\n[${new Date().toISOString()}]`);
  console.log(`요청 메서드: ${req.method}`);
  console.log(`요청 URL: ${req.originalUrl}`);
  console.log('요청 경로 매개변수:', req.params);
  console.log('요청 쿼리 매개변수:', req.query);
  console.log('요청 헤더:', req.headers);
  console.log('요청 바디:', req.body);

  // 미들웨어 실행 로깅을 위한 래퍼
  const trackMiddleware = (layer: any, index: number) => {
    const layerName = layer.name || '<익명 미들웨어>';
    const routePath = layer?.route?.path || layer?.regexp?.toString() || 'N/A';
    middlewareSequence.push(`${index + 1}: ${layerName} (경로: ${routePath})`);
  };

  // Express 스택에서 라우터/미들웨어 추적
  const stack = (req.app._router.stack || []).filter((layer: any) => layer.handle); // 실행 가능한 핸들러만 필터링
  stack.forEach(trackMiddleware);

  console.log('미들웨어 스택:');
  middlewareSequence.forEach((item) => console.log(`  ${item}`));

  // 응답 완료 후 로깅
  res.on('finish', () => {
    const elapsedTime = Date.now() - startTime;
    console.log(`응답 상태 코드: ${res.statusCode}`);
    console.log(`처리 소요 시간: ${elapsedTime}ms`);
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`\n[${new Date().toISOString()}]`);
  console.error('에러 메시지:', err.message);
  console.error('에러 스택:', err.stack);
  console.error('요청 메서드:', req.method);
  console.error('요청 URL:', req.originalUrl);
  console.error('요청 헤더:', req.headers);
  console.error('요청 바디:', req.body);

  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
};

// 통합 로깅 미들웨어
export const unifiedLogger = (req: Request, res: Response, next: NextFunction): void => {
  try {
    requestLogger(req, res, () => {
      next();
    });
  } catch (err) {
    if (err instanceof Error) {
      errorLogger(err, req, res, next);
    } else {
      console.error('예상치 못한 에러:', err);
      res.status(500).json({ error: 'Unexpected Error' });
    }
  }
};
