package com.yei.idphoto;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PointF;
import android.graphics.Rect;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;
import com.google.mlkit.vision.face.FaceLandmark;

import java.util.List;

/**
 * 온디바이스 얼굴 검출 (ML Kit Face Detection).
 * 입력: base64 이미지. 출력: 가장 큰 얼굴의 박스 + 눈/입 좌표(0~1 정규화) 또는 null.
 * 잡티 완화를 얼굴(피부) 영역에만 적용하기 위한 좌표만 제공 — 스무딩은 JS 캔버스에서.
 */
@CapacitorPlugin(name = "FaceDetect")
public class FaceDetectPlugin extends Plugin {

    @PluginMethod
    public void detect(PluginCall call) {
        final String data = call.getString("data");
        if (data == null) {
            call.reject("입력 이미지가 없습니다.");
            return;
        }

        new Thread(() -> {
            Bitmap bitmap = null;
            try {
                byte[] bytes = Base64.decode(data, Base64.DEFAULT);
                bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                if (bitmap == null) {
                    call.reject("이미지를 디코드할 수 없습니다.");
                    return;
                }
                final float iw = bitmap.getWidth();
                final float ih = bitmap.getHeight();

                FaceDetectorOptions options = new FaceDetectorOptions.Builder()
                        // FAST: 정면 단일 얼굴(증명사진)엔 충분하고 ACCURATE보다 훨씬 빠름
                        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                        .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
                        .build();
                FaceDetector detector = FaceDetection.getClient(options);
                List<Face> faces = Tasks.await(detector.process(InputImage.fromBitmap(bitmap, 0)));
                detector.close();

                JSObject ret = new JSObject();
                if (faces == null || faces.isEmpty()) {
                    ret.put("face", JSObject.NULL);
                    call.resolve(ret);
                    return;
                }

                // 가장 큰 얼굴 선택 (증명사진 = 단일 인물)
                Face best = faces.get(0);
                for (Face f : faces) {
                    Rect b = f.getBoundingBox();
                    Rect bb = best.getBoundingBox();
                    if ((long) b.width() * b.height() > (long) bb.width() * bb.height()) best = f;
                }

                Rect box = best.getBoundingBox();
                JSObject face = new JSObject();
                face.put("x", box.left / iw);
                face.put("y", box.top / ih);
                face.put("w", box.width() / iw);
                face.put("h", box.height() / ih);
                putLandmark(face, "leftEye", best.getLandmark(FaceLandmark.LEFT_EYE), iw, ih);
                putLandmark(face, "rightEye", best.getLandmark(FaceLandmark.RIGHT_EYE), iw, ih);
                putLandmark(face, "mouth", best.getLandmark(FaceLandmark.MOUTH_BOTTOM), iw, ih);

                ret.put("face", face);
                call.resolve(ret);
            } catch (Throwable e) {
                call.reject("얼굴 검출 실패: " + e.getMessage());
            } finally {
                if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
            }
        }).start();
    }

    private void putLandmark(JSObject face, String key, FaceLandmark lm, float iw, float ih) {
        if (lm == null) return;
        PointF p = lm.getPosition();
        JSObject pt = new JSObject();
        pt.put("x", p.x / iw);
        pt.put("y", p.y / ih);
        face.put(key, pt);
    }
}
