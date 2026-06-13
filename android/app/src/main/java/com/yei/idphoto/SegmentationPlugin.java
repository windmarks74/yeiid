package com.yei.idphoto;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.segmentation.Segmentation;
import com.google.mlkit.vision.segmentation.SegmentationMask;
import com.google.mlkit.vision.segmentation.Segmenter;
import com.google.mlkit.vision.segmentation.selfie.SelfieSegmenterOptions;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

/**
 * 온디바이스 인물 분리 (ML Kit Selfie Segmentation).
 * 입력: base64 이미지. 출력: 전경(사람)만 남긴 알파 PNG(base64).
 * 무거운 연산은 전부 네이티브 — WebView 메모리/스레딩 문제 회피.
 * 합성(흰 배경 등)은 JS 캔버스에서 기존 로직 재사용.
 */
@CapacitorPlugin(name = "Segmentation")
public class SegmentationPlugin extends Plugin {

    @PluginMethod
    public void segment(PluginCall call) {
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

                SelfieSegmenterOptions options = new SelfieSegmenterOptions.Builder()
                        .setDetectorMode(SelfieSegmenterOptions.SINGLE_IMAGE_MODE)
                        .build();
                Segmenter segmenter = Segmentation.getClient(options);

                InputImage image = InputImage.fromBitmap(bitmap, 0);
                SegmentationMask mask = Tasks.await(segmenter.process(image));
                segmenter.close();

                int w = mask.getWidth();
                int h = mask.getHeight();
                ByteBuffer buffer = mask.getBuffer();

                // 마스크 신뢰도(전경) → 알파, 원본 RGB 유지
                int[] src = new int[w * h];
                bitmap.getPixels(src, 0, w, 0, 0, w, h);
                int[] out = new int[w * h];
                for (int i = 0; i < w * h; i++) {
                    float conf = buffer.getFloat();
                    int a = (int) (conf * 255f);
                    if (a < 0) a = 0;
                    if (a > 255) a = 255;
                    out[i] = (a << 24) | (src[i] & 0x00FFFFFF);
                }
                Bitmap result = Bitmap.createBitmap(out, w, h, Bitmap.Config.ARGB_8888);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                result.compress(Bitmap.CompressFormat.PNG, 100, baos);
                result.recycle();
                String b64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);

                JSObject ret = new JSObject();
                ret.put("cutout", b64);
                call.resolve(ret);
            } catch (Throwable e) {
                // Throwable까지 잡아 OOM 등도 크래시 없이 JS로 거절 → 원본 폴백
                call.reject("배경 분리 실패: " + e.getMessage());
            } finally {
                if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
            }
        }).start();
    }
}
